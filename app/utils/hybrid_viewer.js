const RGB_MAX = 255;
const BACKGROUND_GREY_VALUE = 180;
const SAMPLE_SIZE = 10;
const TOTAL_CHANNELS = 400;
const RGBA_CHANNELS = 4;

function getCameraOptions(camera) {
  if (!camera) {
    return undefined;
  }

  if (typeof camera.getFocalPoint !== "function") {
    return { ...camera };
  }
  return {
    focal_point: [...camera.getFocalPoint()],
    view_up: [...camera.getViewUp()],
    position: [...camera.getPosition()],
    view_angle: camera.getViewAngle(),
    clipping_range: [...camera.getClippingRange()],
    distance: camera.getDistance(),
  };
}

function applyCameraOptions(camera, options) {
  if (!camera || !options) {
    return;
  }
  if (options.focal_point) {
    camera.setFocalPoint(...options.focal_point);
  }
  if (options.view_up) {
    camera.setViewUp(...options.view_up);
  }
  if (options.position) {
    camera.setPosition(...options.position);
  }
  if (options.view_angle) {
    camera.setViewAngle(options.view_angle);
  }
  if (options.clipping_range) {
    camera.setClippingRange(...options.clipping_range);
  }
}

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

  const { relX, relY, relW, relH } = mapRect(rect, latestImage, canvas.getBoundingClientRect());

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

function centerCameraOnPosition(camera, pickedPosition) {
  if (!camera || !pickedPosition) {
    return;
  }
  const focalPoint = camera.getFocalPoint();
  const position = camera.getPosition();
  camera.setFocalPoint(...pickedPosition);
  camera.setPosition(
    position[0] + pickedPosition[0] - focalPoint[0],
    position[1] + pickedPosition[1] - focalPoint[1],
    position[2] + pickedPosition[2] - focalPoint[2],
  );
}

function performClickPicking(event, options) {
  const { container, viewerStore, viewer_schemas, genericRenderWindow, syncRemoteCamera } = options;
  const rect = container.getBoundingClientRect();
  const display_x = Math.round(event.clientX - rect.left);
  const display_y = Math.round(rect.height - (event.clientY - rect.top));
  viewerStore.request(
    viewer_schemas.opengeodeweb_viewer.viewer.get_point_position,
    { x: display_x, y: display_y },
    {
      response_function: (response) => {
        const pickedPos = [response.x, response.y, response.z];
        if (pickedPos.some((value) => value !== 0)) {
          const camera = genericRenderWindow.getRenderer().getActiveCamera();
          centerCameraOnPosition(camera, pickedPos);
          genericRenderWindow.getRenderWindow().render();
          syncRemoteCamera();
        }
      },
    },
  );
}

async function applySnapshot(snapshot, options) {
  const {
    genericRenderWindow,
    viewerStore,
    viewer_schemas,
    camera_options,
    setZScaling,
    remoteRender,
  } = options;
  if (!snapshot) {
    return;
  }
  const z_scale = snapshot.zScale;

  function applyCamera() {
    const { camera_options: snapshot_camera_options } = snapshot;
    if (!snapshot_camera_options) {
      return;
    }
    const renderer = genericRenderWindow.getRenderer();
    const camera = renderer.getActiveCamera();
    applyCameraOptions(camera, snapshot_camera_options);
    genericRenderWindow.getRenderWindow().render();

    const payload = {
      camera_options: getCameraOptions(snapshot_camera_options),
    };
    return viewerStore.request(viewer_schemas.opengeodeweb_viewer.viewer.update_camera, payload, {
      response_function: () => {
        remoteRender();
        Object.assign(camera_options, payload.camera_options);
      },
    });
  }

  if (typeof z_scale === "number") {
    await setZScaling(z_scale);
  }
  return await applyCamera();
}

export {
  applyCameraOptions,
  applySnapshot,
  centerCameraOnPosition,
  computeAverageBrightness,
  getCameraOptions,
  performClickPicking,
};
