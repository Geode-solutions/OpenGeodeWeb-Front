export function getDeterministicColor(identifier) {
  const CIRCLE_DEGREES = 360;
  const HASH_PRIME = 31;
  const DEGREES_PER_STEP = 30;
  const STEPS_COUNT = 12;
  const BASE_LIGHTNESS = 0.5;
  const VIBRANCY_RANGE = 0.35;
  const MIRROR_MAX = 9;
  const RGB_MAX = 255;
  const PHASE_GREEN = 8;

  if (!identifier) {
    return { r: 128, g: 128, b: 128 };
  }
  let hash_accumulator = 0;
  for (let index = 0; index < identifier.length; index += 1) {
    hash_accumulator = identifier.codePointAt(index) + hash_accumulator * HASH_PRIME;
  }
  const hue_angle = Math.abs(hash_accumulator % CIRCLE_DEGREES);

  function to_component_value(phase_shift) {
    const step = (phase_shift + hue_angle / DEGREES_PER_STEP) % STEPS_COUNT;
    const intensity =
      BASE_LIGHTNESS - VIBRANCY_RANGE * Math.max(Math.min(step - 3, MIRROR_MAX - step, 1), -1);
    return Math.round(RGB_MAX * intensity);
  }
  return {
    r: to_component_value(0),
    g: to_component_value(PHASE_GREEN),
    b: to_component_value(4),
  };
}
