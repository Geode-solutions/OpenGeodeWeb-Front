import { BACKGROUND_GREY_VALUE, RGB_MAX } from "./hybrid_viewer_constants";
import { centerCameraOnPosition } from "./hybrid_viewer_camera";

const RGBA_CHANNELS = 4;
const SAMPLE_SIZE = 10;
const TOTAL_CHANNELS = 400;

function mapRect(rect, latestImage, canvasRect) {
  const scaleX = latestImage.width / canvasRect.width;
  const scaleY = latestImage.height / canvasRect.height;
  return {
    relX: (rect.x - canvasRect.left) * scaleX,
    relY: (rect.y - canvasRect.top) * scaleY,
    relW: rect.width * scaleX,
    relH: rect.height * scaleY,
  };
}

function computeAverageBrightness(rect, options) {
  const { latestImage, offscreenCtx, offscreenCanvas, genericRenderWindow } = options;
  if (!latestImage || !offscreenCtx || !offscreenCanvas || !genericRenderWindow) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  const canvas = genericRenderWindow.getApiSpecificRenderWindow().getCanvas();
  if (!canvas) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  if (rect.width <= 0 || rect.height <= 0) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  const { relX, relY, relW, relH } = mapRect(rect, latestImage, canvas.getBoundingClientRect());
  if (relW <= 0 || relH <= 0) {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
  offscreenCanvas.width = SAMPLE_SIZE;
  offscreenCanvas.height = SAMPLE_SIZE;
  try {
    offscreenCtx.drawImage(
      latestImage,
      Math.max(0, relX),
      Math.max(0, relY),
      Math.min(latestImage.width, relW),
      Math.min(latestImage.height, relH),
      0,
      0,
      SAMPLE_SIZE,
      SAMPLE_SIZE,
    );
    const { data } = offscreenCtx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    let minBrightness = 1;
    for (let i = 0; i < TOTAL_CHANNELS; i += RGBA_CHANNELS) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / (3 * RGB_MAX);
      if (brightness < minBrightness) {
        minBrightness = brightness;
      }
    }
    return minBrightness;
  } catch {
    return BACKGROUND_GREY_VALUE / RGB_MAX;
  }
}

function performClickPicking(event, options) {
  const { container, viewerStore, viewer_schemas, genericRenderWindow, syncRemoteCamera } = options;
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

function performHoverHighlight(event, options) {
  const {
    is_hover_highlight,
    genericRenderWindow,
    viewerStore,
    viewer_schemas,
    hover_highlight_field_type,
    hybridDb,
    onResponse,
  } = options;
  if (!is_hover_highlight.value) {
    return;
  }
  const container = genericRenderWindow.getContainer();
  if (!container) {
    return;
  }
  const rect = container.getBoundingClientRect();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.get_point_position;
  const params = {
    x: Math.round(event.clientX - rect.left),
    y: Math.round(rect.height - (event.clientY - rect.top)),
    field_type: hover_highlight_field_type.value,
    ids: Object.keys(hybridDb),
  };
  viewerStore.request(
    {
      schema,
      params,
    },
    {
      response_function: onResponse,
    },
  );
}

function performClearHoverHighlight(options) {
  const { viewerStore, viewer_schemas, hover_highlight_field_type, hybridDb } = options;
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.clear_highlight;
  const params = {
    x: -1,
    y: -1,
    field_type: hover_highlight_field_type.value,
    ids: Object.keys(hybridDb),
  };
  viewerStore.request({ schema, params });
}

async function performAddItem(id, options) {
  const {
    genericRenderWindow,
    dataStore,
    vtkXMLPolyDataReader,
    vtkActor,
    vtkMapper,
    actorColor,
    hybridDb,
  } = options;
  if (!genericRenderWindow) {
    return;
  }
  const reader = vtkXMLPolyDataReader(),
    value = await dataStore.item(id);
  await reader.parseAsArrayBuffer(new TextEncoder().encode(value.binary_light_viewable));
  const actor = vtkActor(),
    mapper = vtkMapper(),
    polydata = reader.getOutputData(0);
  mapper.setInputData(polydata);
  actor.getProperty().setColor(actorColor);
  actor.setMapper(mapper);
  const renderer = genericRenderWindow.getRenderer();
  const isFirst = renderer.getActors().length === 0;
  renderer.addActor(actor);
  if (isFirst) {
    renderer.resetCamera();
  }
  hybridDb[id] = { actor, polydata, mapper };
}

async function performSetZScaling(z_scale, options) {
  const { zScale, genericRenderWindow, gridActor, viewerStore, viewer_schemas, remoteRender } =
    options;
  zScale.value = z_scale;
  const renderer = genericRenderWindow.getRenderer();
  for (const actor of renderer.getActors()) {
    if (actor !== gridActor) {
      const scale = actor.getScale();
      actor.setScale(scale[0], scale[1], z_scale);
    }
  }
  renderer.resetCamera();
  genericRenderWindow.getRenderWindow().render();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.set_z_scaling;
  const params = { z_scale };
  await viewerStore.request({ schema, params });
  remoteRender();
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
    viewer_schemas,
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
          viewer_schemas,
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

function performRemoveItem(id, options) {
  const { genericRenderWindow, hybridDb } = options;
  if (!hybridDb[id]) {
    return;
  }
  genericRenderWindow.getRenderer().removeActor(hybridDb[id].actor);
  genericRenderWindow.getRenderWindow().render();
  delete hybridDb[id];
}

function performSetVisibility(id, visibility, options) {
  const { genericRenderWindow, hybridDb } = options;
  if (!hybridDb[id]) {
    return;
  }
  hybridDb[id].actor.setVisibility(visibility);
  genericRenderWindow.getRenderWindow().render();
}

function performClear(options) {
  const { genericRenderWindow, hybridDb } = options;
  const renderer = genericRenderWindow.getRenderer();
  for (const actor of renderer.getActors()) {
    renderer.removeActor(actor);
  }
  genericRenderWindow.getRenderWindow().render();
  for (const id of Object.keys(hybridDb)) {
    delete hybridDb[id];
  }
}

export {
  computeAverageBrightness,
  performAddItem,
  performClearHoverHighlight,
  performClickPicking,
  performHoverHighlight,
  performSetContainer,
  performSetZScaling,
  performRemoveItem,
  performSetVisibility,
  performClear,
};
