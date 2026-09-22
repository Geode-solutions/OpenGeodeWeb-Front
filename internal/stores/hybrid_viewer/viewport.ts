import type { Vector3, ViewStreamLike } from "./vtk_types";
import { centerCameraOnPosition, useHybridViewerCamera } from "./camera";
import { Status } from "@ogw_front/utils/status";
import { WHEEL_TIME_OUT_MS } from "./constants";
import { useHybridViewerCore } from "./core";
import { useHybridViewerHighlight } from "./highlight";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

type ContainerRef = Ref<{ $el: HTMLElement } | undefined>;

interface HybridViewerViewport {
  setContainer: (container: ContainerRef | undefined) => void;
  resize: (width: number, height: number) => Promise<void>;
  viewStream: Ref<ViewStreamLike | undefined>;
}

async function performResize(width: number, height: number): Promise<void> {
  const { genericRenderWindow, remoteRender, status, viewStream } = useHybridViewerCore();
  const viewerStore = useViewerStore();
  if (viewerStore.status !== Status.CONNECTED || status.value !== Status.CREATED) {
    return;
  }
  const renderWindow = genericRenderWindow.value;
  if (!renderWindow) {
    return;
  }
  // oxlint-disable-next-line no-unsafe-assignment -- vtk.js has no types for getApiSpecificRenderWindow(); narrowed below.
  const webGLRenderWindow = renderWindow.getApiSpecificRenderWindow();
  // oxlint-disable-next-line no-unsafe-type-assertion -- trusted vtk.js OpenGL render window API boundary.
  const openGLRenderWindow = webGLRenderWindow as unknown as {
    getCanvas: () => HTMLCanvasElement;
    setSize: (width: number, height: number) => void;
  };
  const canvas = openGLRenderWindow.getCanvas();
  canvas.width = width;
  canvas.height = height;
  await nextTick();
  openGLRenderWindow.setSize(width, height);
  if (viewStream.value) {
    viewStream.value.setSize(width, height);
  }
  renderWindow.getRenderWindow().render();
  await remoteRender();
}

function performClickPicking(event: MouseEvent, containerElement: HTMLElement): void {
  const { genericRenderWindow } = useHybridViewerCore();
  const { syncRemoteCamera } = useHybridViewerCamera();
  const viewerStore = useViewerStore();
  const rect = containerElement.getBoundingClientRect();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.get_point_position;
  const params = {
    x: Math.round(event.clientX - rect.left),
    y: Math.round(rect.height - (event.clientY - rect.top)),
  };
  void viewerStore.request(
    {
      schema,
      params,
    },
    {
      response_function: (response: unknown) => {
        // oxlint-disable-next-line no-unsafe-type-assertion -- response shape is defined by the get_point_position schema.
        const { x, y, z } = response as { x: number; y: number; z: number };
        const pickedPos: Vector3 = [x, y, z];
        if (!genericRenderWindow.value || !pickedPos.some((val) => val !== 0)) {
          return;
        }
        const renderer = genericRenderWindow.value.getRenderer();
        const camera = renderer.getActiveCamera();
        centerCameraOnPosition(camera, pickedPos);
        genericRenderWindow.value.getRenderWindow().render();
        syncRemoteCamera();
      },
    },
  );
}

function performSetContainer(container: ContainerRef | undefined): void {
  if (!container || !container.value) {
    return;
  }
  const containerElement = container.value.$el;
  const { genericRenderWindow, is_picking, is_moving } = useHybridViewerCore();
  const { syncRemoteCamera } = useHybridViewerCamera();
  const { hoverHighlight } = useHybridViewerHighlight();
  if (!genericRenderWindow.value) {
    return;
  }
  genericRenderWindow.value.setContainer(containerElement);
  // oxlint-disable-next-line no-unsafe-assignment -- vtk.js has no types for getApiSpecificRenderWindow(); narrowed below.
  const webGLRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
  // oxlint-disable-next-line no-unsafe-type-assertion -- trusted vtk.js OpenGL render window API boundary.
  const openGLRenderWindow = webGLRenderWindow as unknown as {
    setUseBackgroundImage: (value: boolean) => void;
    getReferenceByName: (name: string) => { style: CSSStyleDeclaration } | undefined;
  };
  openGLRenderWindow.setUseBackgroundImage(true);
  const imageStyle = openGLRenderWindow.getReferenceByName("bgImage")?.style;
  Object.assign(imageStyle ?? {}, {
    transition: "opacity 0.1s ease-in",
    zIndex: 1,
  });
  void performResize(containerElement.offsetWidth, containerElement.offsetHeight);
  let has_dragged = false;
  useMousePressed({
    target: containerElement,
    onPressed: (event: MouseEvent | TouchEvent | DragEvent) => {
      if (!(event instanceof MouseEvent)) {
        return;
      }
      if (event.button !== 0 && event.button !== 1) {
        return;
      }
      if (event.button === 0 && is_picking.value) {
        performClickPicking(event, containerElement);
        is_picking.value = false;
        return;
      }
      is_moving.value = true;
      has_dragged = false;
      event.stopPropagation();
    },
    onReleased: () => {
      is_moving.value = false;
      if (has_dragged && genericRenderWindow.value) {
        const renderer = genericRenderWindow.value.getRenderer();
        renderer.resetCameraClippingRange();
        syncRemoteCamera();
      }
      has_dragged = false;
    },
  });
  useEventListener(containerElement, "mousemove", (event: MouseEvent) => {
    if (is_moving.value) {
      has_dragged = true;
      if (imageStyle) {
        imageStyle.opacity = "0";
      }
    }
    void (async (): Promise<void> => {
      try {
        await hoverHighlight(event);
      } catch {
        // Ignore hover highlight failures
      }
    })();
  });
  let wheelEventEndTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
  useEventListener(containerElement, "wheel", () => {
    is_moving.value = true;
    if (imageStyle) {
      imageStyle.opacity = "0";
    }
    clearTimeout(wheelEventEndTimeout);
    wheelEventEndTimeout = setTimeout(() => {
      is_moving.value = false;
      if (!genericRenderWindow.value) {
        return;
      }
      const renderer = genericRenderWindow.value.getRenderer();
      renderer.resetCameraClippingRange();
      syncRemoteCamera();
    }, WHEEL_TIME_OUT_MS);
  });
}
function useHybridViewerViewport(): HybridViewerViewport {
  const { viewStream } = useHybridViewerCore();
  return {
    setContainer: performSetContainer,
    resize: performResize,
    viewStream,
  };
}
export { performClickPicking, performResize, performSetContainer, useHybridViewerViewport };
export type { ViewStreamLike } from "./vtk_types";
