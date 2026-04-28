const ORIENTATIONS = {
  zplus: { position: [0, 0, 1], view_up: [0, 1, 0] },
  zminus: { position: [0, 0, -1], view_up: [0, 1, 0] },
  yplus: { position: [0, 1, 0], view_up: [0, 0, 1] },
  yminus: { position: [0, -1, 0], view_up: [0, 0, 1] },
  xplus: { position: [1, 0, 0], view_up: [0, 0, 1] },
  xminus: { position: [-1, 0, 0], view_up: [0, 0, 1] },
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
