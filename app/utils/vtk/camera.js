const ORIENTATIONS = {
  top: { direction: [0, 0, 1], viewUp: [0, 1, 0] },
  bottom: { direction: [0, 0, -1], viewUp: [0, 1, 0] },
  north: { direction: [0, 1, 0], viewUp: [0, 0, 1] },
  south: { direction: [0, -1, 0], viewUp: [0, 0, 1] },
  east: { direction: [1, 0, 0], viewUp: [0, 0, 1] },
  west: { direction: [-1, 0, 0], viewUp: [0, 0, 1] },
};

function getCameraState(camera) {
  return {
    focal_point: camera.getFocalPoint(),
    view_up: camera.getViewUp(),
    position: camera.getPosition(),
    view_angle: camera.getViewAngle(),
    clipping_range: camera.getClippingRange(),
    distance: camera.getDistance(),
    viewMatrix: camera.getViewMatrix(),
  };
}

function setCameraState(camera, state) {
  if (!state) {
    return;
  }
  camera.set({
    focalPoint: state.focal_point,
    viewUp: state.view_up,
    position: state.position,
    viewAngle: state.view_angle,
    clippingRange: state.clipping_range,
  });
}

export { ORIENTATIONS, getCameraState, setCameraState };
