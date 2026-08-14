import { WHEEL_TIME_OUT_MS } from "./constants";
import { centerCameraOnPosition } from "./camera";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

function useHybridViewerViewport(options) {
  const {
    genericRenderWindow,
    remoteRender,
    status,
    Status,
    is_picking,
    is_moving,
    syncRemoteCamera,
    hoverHighlight,
    setImageStyle,
  } = options;

  const viewerStore = useViewerStore();
  const viewStream = ref(undefined);
  let wheelEventEndTimeout = undefined;

  function setContainer(container) {
    performSetContainer({
      container,
      genericRenderWindow: genericRenderWindow.value,
      imageStyleSetter: (style) => setImageStyle(style),
      resize,
      useMousePressed,
      useEventListener,
      is_picking,
      is_moving,
      clickPickingCallback: performClickPicking,
      viewerStore,
      syncRemoteCamera,
      hoverHighlight,
      wheelTimeoutMs: WHEEL_TIME_OUT_MS,
      wheelEventEndTimeout,
      wheelTimeoutSetter: (timeout) => (wheelEventEndTimeout = timeout),
    });
  }

  async function resize(width, height) {
    await performResize(width, height, {
      viewerStore,
      status,
      Status,
      genericRenderWindow: genericRenderWindow.value,
      viewStream: viewStream.value,
      remoteRender,
    });
  }

  return {
    setContainer,
    resize,
    viewStream,
  };
}

function performClickPicking(event, options) {
  const { container, viewerStore, genericRenderWindow, syncRemoteCamera } = options;
  const rect = container.getBoundingClientRect();
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
          const camera = genericRenderWindow.getRenderer().getActiveCamera();
          centerCameraOnPosition(camera, pickedPos);
          genericRenderWindow.getRenderWindow().render();
          syncRemoteCamera();
        }
      },
    },
  );
}

function performSetContainer(options) {
  const {
    container,
    genericRenderWindow,
    imageStyleSetter,
    resize,
    useMousePressed,
    useEventListener,
    is_picking,
    is_moving,
    clickPickingCallback,
    viewerStore,
    syncRemoteCamera,
    hoverHighlight,
    wheelTimeoutMs,
    wheelEventEndTimeout,
    wheelTimeoutSetter,
  } = options;

  if (!container.value) {
    return;
  }

  genericRenderWindow.setContainer(container.value.$el);
  const webGLRenderWindow = genericRenderWindow.getApiSpecificRenderWindow();
  webGLRenderWindow.setUseBackgroundImage(true);
  const imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style;
  Object.assign(imageStyle, { transition: "opacity 0.1s ease-in", zIndex: 1 });
  imageStyleSetter(imageStyle);

  resize(container.value.$el.offsetWidth, container.value.$el.offsetHeight);

  let has_dragged = false;
  useMousePressed({
    target: container,
    onPressed: (event) => {
      if (event.button !== 0 && event.button !== 1) {
        return;
      }
      if (event.button === 0 && is_picking.value) {
        clickPickingCallback(event, {
          container: container.value.$el,
          viewerStore,
          genericRenderWindow,
          syncRemoteCamera,
        });
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
        genericRenderWindow.getRenderer().resetCameraClippingRange();
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
  useEventListener(container, "wheel", () => {
    is_moving.value = true;
    if (imageStyle) {
      imageStyle.opacity = 0;
    }
    clearTimeout(wheelEventEndTimeout);
    wheelTimeoutSetter(
      setTimeout(() => {
        is_moving.value = false;
        genericRenderWindow.getRenderer().resetCameraClippingRange();
        syncRemoteCamera();
      }, wheelTimeoutMs),
    );
  });
}

async function performResize(width, height, options) {
  const { viewerStore, status, Status, genericRenderWindow, viewStream, remoteRender } = options;
  if (viewerStore.status !== Status.CONNECTED || status.value !== Status.CREATED) {
    return;
  }
  const webGLRenderWindow = genericRenderWindow.getApiSpecificRenderWindow();
  const canvas = webGLRenderWindow.getCanvas();
  canvas.width = width;
  canvas.height = height;
  await nextTick();
  webGLRenderWindow.setSize(width, height);
  viewStream.setSize(width, height);
  genericRenderWindow.getRenderWindow().render();
  remoteRender();
}

export { performClickPicking, performResize, performSetContainer, useHybridViewerViewport };
