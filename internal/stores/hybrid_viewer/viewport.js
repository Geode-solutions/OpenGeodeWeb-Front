import { Status } from "@ogw_front/utils/status";
import { WHEEL_TIME_OUT_MS } from "./constants";
import { centerCameraOnPosition } from "./camera";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

function useHybridViewerViewport() {
  const viewStream = ref(undefined);

  function setContainer(container) {
    performSetContainer(container);
  }

  async function resize(width, height) {
    await performResize(width, height);
  }

  return {
    setContainer,
    resize,
    viewStream,
  };
}

function performClickPicking(event, containerElement) {
  const { genericRenderWindow, syncRemoteCamera } = useHybridViewerStore();
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
      response_function: ({ x, y, z }) => {
        const pickedPos = [x, y, z];
        if (pickedPos.some((val) => val !== 0)) {
          const renderer = genericRenderWindow.value.getRenderer();
          const camera = renderer.getActiveCamera();
          centerCameraOnPosition(camera, pickedPos);
          const renderWindow = genericRenderWindow.value.getRenderWindow();
          renderWindow.render();
          syncRemoteCamera();
        }
      },
    },
  );
}

function performSetContainer(container) {
  if (!container || !container.value) {
    return;
  }

  const hybridViewerStore = useHybridViewerStore();
  const { genericRenderWindow, syncRemoteCamera, hoverHighlight } = hybridViewerStore;
  const { is_picking, is_moving } = storeToRefs(hybridViewerStore);

  genericRenderWindow.value.setContainer(container.value.$el);
  const webGLRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
  webGLRenderWindow.setUseBackgroundImage(true);
  const imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style;
  Object.assign(imageStyle, { transition: "opacity 0.1s ease-in", zIndex: 1 });

  performResize(container.value.$el.offsetWidth, container.value.$el.offsetHeight);

  let has_dragged = false;
  useMousePressed({
    target: container,
    onPressed: (event) => {
      if (event.button !== 0 && event.button !== 1) {
        return;
      }
      if (event.button === 0 && is_picking.value) {
        performClickPicking(event, container.value.$el);
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
        const renderer = genericRenderWindow.value.getRenderer();
        renderer.resetCameraClippingRange();
        syncRemoteCamera();
      }
      has_dragged = false;
    },
  });

  useEventListener(container, "mousemove", (event) => {
    if (is_moving.value) {
      has_dragged = true;
      if (imageStyle) {
        imageStyle.opacity = 0;
      }
    }
    hoverHighlight(event);
  });

  let wheelEventEndTimeout = undefined;
  useEventListener(container, "wheel", () => {
    is_moving.value = true;
    if (imageStyle) {
      imageStyle.opacity = 0;
    }
    clearTimeout(wheelEventEndTimeout);
    wheelEventEndTimeout = setTimeout(() => {
      is_moving.value = false;
      const renderer = genericRenderWindow.value.getRenderer();
      renderer.resetCameraClippingRange();
      syncRemoteCamera();
    }, WHEEL_TIME_OUT_MS);
  });
}

async function performResize(width, height) {
  const hybridViewerStore = useHybridViewerStore();
  const { genericRenderWindow, remoteRender } = hybridViewerStore;
  const { status, viewStream } = storeToRefs(hybridViewerStore);
  const viewerStore = useViewerStore();
  if (viewerStore.status !== Status.CONNECTED || status.value !== Status.CREATED) {
    return;
  }
  const webGLRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
  const canvas = webGLRenderWindow.getCanvas();
  canvas.width = width;
  canvas.height = height;
  await nextTick();
  webGLRenderWindow.setSize(width, height);
  if (viewStream.value) {
    viewStream.value.setSize(width, height);
  }
  const renderWindow = genericRenderWindow.value.getRenderWindow();
  renderWindow.render();
  await remoteRender();
}

export { performClickPicking, performResize, performSetContainer, useHybridViewerViewport };
