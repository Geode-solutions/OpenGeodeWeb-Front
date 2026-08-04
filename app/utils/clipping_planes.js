const AXIS_SCALE = 0.45;
const SIZE_RATIO = 0.1;
const DEBOUNCE_DELAY = 200;
const CHANGE_THRESHOLD = 1e-4;
// oxlint-disable no-magic-numbers
const COLOR_BLUE = [0.12, 0.53, 0.9];
const COLOR_GREEN = [0.26, 0.63, 0.28];
const COLOR_ORANGE = [0.98, 0.55, 0];
const COLOR_PURPLE = [0.55, 0.14, 0.67];
const COLOR_RED = [0.9, 0.22, 0.21];
// oxlint-enable no-magic-numbers
const PLANE_COLORS = [COLOR_BLUE, COLOR_GREEN, COLOR_ORANGE, COLOR_PURPLE, COLOR_RED];
const NORMAL_X = [1, 0, 0];
const NORMAL_Y = [0, 1, 0];
const NORMAL_Z = [0, 0, 1];
const DEFAULT_NORMALS = [NORMAL_X, NORMAL_Y, NORMAL_Z];
const RGB_MAX_VALUE = 255;

function getPlaneCssColor(index) {
  const rgb = PLANE_COLORS[index % PLANE_COLORS.length];
  return `rgb(${rgb.map((channel) => Math.round(channel * RGB_MAX_VALUE)).join(",")})`;
}

function hasPlaneChanged(origin, normal, currentOrigin, currentNormal) {
  if (!currentOrigin) {
    return true;
  }
  return (
    origin.some((val, idx) => Math.abs(val - currentOrigin[idx]) > CHANGE_THRESHOLD) ||
    normal.some((val, idx) => Math.abs(val - currentNormal[idx]) > CHANGE_THRESHOLD)
  );
}

function getPlaneStyle(rgb) {
  return {
    active: {
      plane: { opacity: 1, color: rgb },
      normal: { opacity: 1, color: rgb },
      origin: { opacity: 1, color: rgb },
    },
    inactive: {
      plane: { opacity: 0.5, color: rgb },
      normal: { opacity: 1, color: rgb },
      origin: { opacity: 1, color: rgb },
    },
    static: {
      display2D: { representation: 0 },
      outline: { color: [1, 1, 1], opacity: 1, representation: 1, interpolation: 0 },
    },
  };
}

function computeSceneBounds(actors) {
  let bounds = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
  for (const actor of actors) {
    const boundsOfActor = actor.getBounds();
    bounds = [
      Math.min(bounds[0], boundsOfActor[0]),
      Math.max(bounds[1], boundsOfActor[1]),
      Math.min(bounds[2], boundsOfActor[2]),
      Math.max(bounds[3], boundsOfActor[3]),
      Math.min(bounds[4], boundsOfActor[4]),
      Math.max(bounds[5], boundsOfActor[5]),
    ];
  }
  return bounds;
}

function computeSceneBoundsInfo(actors) {
  if (!actors || actors.length === 0) {
    return { center: [0, 0, 0], cubicBounds: [-1, 1, -1, 1, -1, 1] };
  }
  const [xmin, xmax, ymin, ymax, zmin, zmax] = computeSceneBounds(actors);
  const center = [
    Number(((xmin + xmax) / 2).toFixed(4)),
    Number(((ymin + ymax) / 2).toFixed(4)),
    Number(((zmin + zmax) / 2).toFixed(4)),
  ];

  const maxActorExtent = Math.max(
    ...actors.map((actor) => {
      const bounds = actor.getBounds();
      return Math.max(bounds[1] - bounds[0], bounds[3] - bounds[2], bounds[5] - bounds[4]);
    }),
  );
  const halfExtent = maxActorExtent / 2;
  const cubicBounds = [
    center[0] - halfExtent,
    center[0] + halfExtent,
    center[1] - halfExtent,
    center[1] + halfExtent,
    center[2] - halfExtent,
    center[2] + halfExtent,
  ];
  return { center, cubicBounds };
}

export {
  AXIS_SCALE,
  SIZE_RATIO,
  DEBOUNCE_DELAY,
  CHANGE_THRESHOLD,
  PLANE_COLORS,
  DEFAULT_NORMALS,
  getPlaneCssColor,
  hasPlaneChanged,
  getPlaneStyle,
  computeSceneBounds,
  computeSceneBoundsInfo,
};
