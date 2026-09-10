const RGB_MAX = 255;
const PERCENT_MAX = 100;

function parseColorString(colorText) {
  if (!colorText) {
    return undefined;
  }
  const rgbMatch = colorText
    .trim()
    .match(
      /^(?:rgba?\()?(?<red>\d{1,3})[\s,]+(?<green>\d{1,3})[\s,]+(?<blue>\d{1,3})(?:[\s,/]+(?<alpha>[\d.%]+))?\)?$/iu,
    );
  if (!rgbMatch) {
    return undefined;
  }

  const { red, green, blue, alpha: rawAlpha } = rgbMatch.groups;
  let alpha = 1;
  if (rawAlpha) {
    alpha = rawAlpha.endsWith("%") ? Number(rawAlpha.slice(0, -1)) / PERCENT_MAX : Number(rawAlpha);
    if (alpha > 1) {
      alpha /= RGB_MAX;
    }
  }
  return { red: Number(red), green: Number(green), blue: Number(blue), alpha };
}

function formatColorString(color, mode) {
  const { red, green, blue, alpha } = color;
  return mode === "rgb"
    ? `rgb(${red}, ${green}, ${blue})`
    : `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export { parseColorString, formatColorString };
