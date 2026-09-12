import type { Ref } from "vue";
import { Status } from "@ogw_front/utils/status";
import { WHEEL_TIME_OUT_MS } from "./constants";
import { centerCameraOnPosition } from "./camera";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";
import type { HybridViewerStorePublic, Vector3 } from "./vtk_types";

type ContainerRef = Ref<{ $el: HTMLElement } | undefined>;

// The image stream object returned by vtk.js's ImageStream.createViewStream();
// vtk.js's own vtkViewStream type declares `onImageReady` with a zero-arg
// callback, which doesn't match how it's actually invoked at runtime (with the
// decoded image), so this describes the shape as it's actually used here.
export interface ViewStreamLike {
  setSize: (width: number, height: number) => void;
  onImageReady: (callback: (event: { image: unknown }) => void) => void;
}

async function performResize(width: number, height: number): Promise<void> {
  const hybridViewerStore = useHybridViewerStore();
  const { genericRenderWindow, remoteRender } = hybridViewerStore as unknown as HybridViewerStorePublic;
  const { status, viewStream } = storeToRefs(hybridViewerStore) as unknown as {
    status: Ref<string>;
    viewStream: Ref<{ setSize: (width: number, height: number) => void } | undefined>;
  };
  const viewerStore = useViewerStore();
  if (viewerStore.status !== Status.CONNECTED || status.value !== Status.CREATED) {
    return;
  }
  const webGLRenderWindow = genericRenderWindow.value!.getApiSpecificRenderWindow();
  const canvas = webGLRenderWindow.getCanvas();
  canvas.width = width;
  canvas.height = height;
  await nextTick();
  webGLRenderWindow.setSize(width, height);
  if (viewStream.value) {
    viewStream.value.setSize(width, height);
  }
  const renderWindow = genericRenderWindow.value!.getRenderWindow();
  renderWindow.render();
  await remoteRender();
}

function performClickPicking(event: MouseEvent, containerElement: HTMLElement): void {
  const { genericRenderWindow, syncRemoteCamera } = useHybridViewerStore() as unknown as HybridViewerStorePublic;
  const viewerStore = useViewerStore();
  const rect = containerElement.getBoundingClientRect();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.get_point_position;
  const params = {
    x: Math.round(event.clientX - rect.left),
    y: Math.round(rect.height - (event.clientY - rect.top)),
  };
  viewerStore.request(
    {
      schema,
      params,
    },
    {
      response_function: (response: unknown) => {
        const { x, y, z } = response as { x: number; y: number; z: number };
        const pickedPos: Vector3 = [x, y, z];
        if (pickedPos.some((val) => val !== 0)) {
          const renderer = genericRenderWindow.value!.getRenderer();
          const camera = renderer.getActiveCamera();
          centerCameraOnPosition(camera, pickedPos);
          const renderWindow = genericRenderWindow.value!.getRenderWindow();
          renderWindow.render();
          syncRemoteCamera();
        }
      },
    },
  );
}

function performSetContainer(container: ContainerRef | undefined): void {
  if (!container || !container.value) {
    return;
  }
  const hybridViewerStore = useHybridViewerStore();
  const { genericRenderWindow, syncRemoteCamera, hoverHighlight } =
    hybridViewerStore as unknown as HybridViewerStorePublic;
  const { is_picking, is_moving } = storeToRefs(hybridViewerStore) as unknown as {
    is_picking: Ref<boolean>;
    is_moving: Ref<boolean>;
  };
  genericRenderWindow.value!.setContainer(container.value.$el);
  const webGLRenderWindow = genericRenderWindow.value!.getApiSpecificRenderWindow();
  webGLRenderWindow.setUseBackgroundImage(true);
  const imageStyle = webGLRenderWindow.getReferenceByName("bgImage")?.style as
    | CSSStyleDeclaration
    | undefined;
  Object.assign(imageStyle ?? {}, {
    transition: "opacity 0.1s ease-in",
    zIndex: 1,
  });
  performResize(container.value.$el.offsetWidth, container.value.$el.offsetHeight);
  let has_dragged = false;
  useMousePressed({
    target: container as never,
    onPressed: (event: MouseEvent | TouchEvent | DragEvent) => {
      if (!(event instanceof MouseEvent)) {
        return;
      }
      if (event.button !== 0 && event.button !== 1) {
        return;
      }
      if (event.button === 0 && is_picking.value) {
        performClickPicking(event, container.value!.$el);
        is_picking.value = false;
        return;
      }
      is_moving.value = true;
      has_dragged = false;
      event.stopPropagation();
    },
    onReleased: () => {
      is_moving.value = false;
      if (has_dragged) {
        const renderer = genericRenderWindow.value!.getRenderer();
        renderer.resetCameraClippingRange();
        syncRemoteCamera();
      }
      has_dragged = false;
    },
  });
  useEventListener(container as never, "mousemove", (event: MouseEvent) => {
    if (is_moving.value) {
      has_dragged = true;
      if (imageStyle) {
        imageStyle.opacity = "0";
      }
    }
    hoverHighlight(event);
  });
  let wheelEventEndTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
  useEventListener(container as never, "wheel", () => {
    is_moving.value = true;
    if (imageStyle) {
      imageStyle.opacity = "0";
    }
    clearTimeout(wheelEventEndTimeout);
    wheelEventEndTimeout = setTimeout(() => {
      is_moving.value = false;
      const renderer = genericRenderWindow.value!.getRenderer();
      renderer.resetCameraClippingRange();
      syncRemoteCamera();
    }, WHEEL_TIME_OUT_MS);
  });
}
function useHybridViewerViewport() {
  const viewStream = ref<ViewStreamLike | undefined>(undefined);
  function setContainer(container: ContainerRef | undefined): void {
    performSetContainer(container);
  }
  async function resize(width: number, height: number): Promise<void> {
    await performResize(width, height);
  }
  return {
    setContainer,
    resize,
    viewStream,
  };
}
export { performClickPicking, performResize, performSetContainer, useHybridViewerViewport };
