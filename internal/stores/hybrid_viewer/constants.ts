const RGB_MAX = 255;
const ACTOR_DARK_VALUE = 20;

const actVal = ACTOR_DARK_VALUE / RGB_MAX;
const ACTOR_COLOR: [number, number, number] = [actVal, actVal, actVal];
const HOVER_TIMEOUT_MS = 500;
const WHEEL_TIME_OUT_MS = 600;
const HOVER_DEBOUNCE_MS = 50;

export { ACTOR_COLOR, HOVER_DEBOUNCE_MS, HOVER_TIMEOUT_MS, RGB_MAX, WHEEL_TIME_OUT_MS };
