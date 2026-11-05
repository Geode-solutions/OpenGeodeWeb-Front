import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

const RGB_MAX = 255;
const PERCENT_MAX = 100;

function parseComponent(val: string, max = RGB_MAX): number {
  if (val.endsWith("%")) {
    return (Number(val.slice(0, -1)) / PERCENT_MAX) * max;
  }
  return Number(val);
}

function clampChannel(value: number): number {
  return Math.min(RGB_MAX, Math.max(0, Math.round(value)));
}

function parseAlpha(alphaText: string | undefined): number {
  if (alphaText === undefined) {
    return 1;
  }
  const rawAlpha = parseComponent(alphaText, 1);
  const calculatedAlpha = rawAlpha > 1 ? rawAlpha / RGB_MAX : rawAlpha;
  const roundedAlpha = Number(calculatedAlpha.toFixed(2));
  return Math.min(1, Math.max(0, roundedAlpha));
}

function parseColorString(colorText: string): RGBAColor | undefined {
  if (colorText === "") {
    return undefined;
  }

  const numbersMatch = colorText.match(/[\d.]+%?/gu);
  if (!numbersMatch || (numbersMatch.length !== 3 && numbersMatch.length !== 4)) {
    return undefined;
  }

  const [redText = "", greenText = "", blueText = "", alphaText] = numbersMatch;
  const red = clampChannel(parseComponent(redText));
  const green = clampChannel(parseComponent(greenText));
  const blue = clampChannel(parseComponent(blueText));
  const alpha = parseAlpha(alphaText);

  if (Number.isNaN(red) || Number.isNaN(green) || Number.isNaN(blue) || Number.isNaN(alpha)) {
    return undefined;
  }

  return { red, green, blue, alpha };
}

function formatColorString(color: RGBAColor, mode: string): string {
  const { red, green, blue, alpha } = color;
  const roundRed = Math.round(red);
  const roundGreen = Math.round(green);
  const roundBlue = Math.round(blue);
  return mode === "rgb"
    ? `rgb(${roundRed}, ${roundGreen}, ${roundBlue})`
    : `rgba(${roundRed}, ${roundGreen}, ${roundBlue}, ${alpha})`;
}

export { parseColorString, formatColorString };
