import type { Coordinates } from "@ogw_front/types/geometry";
// A number as it is written in a copied coordinate: "-12", "3.5", ".5", "1e-3"
const NUMBER_PATTERN = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/gu;
const COORDINATE_COUNT = 3;
const MIN_PASTED_COORDINATES = 2;

// The numbers of a pasted text, whatever separates them: "1.5, 2; -3e2" gives [1.5, 2, -300]
function parseCoordinates(text: string): Coordinates {
  return (text.match(NUMBER_PATTERN) ?? []).map(Number);
}

// A pasted point ("x y z", "x, y, z", a spreadsheet row...) fills every axis at once. A single
// Number is left to the browser, which pastes it in the field the user is in.
function pasteCoordinates(event: ClipboardEvent, target: Coordinates): void {
  const values = parseCoordinates(event.clipboardData?.getData("text") ?? "");
  if (values.length < MIN_PASTED_COORDINATES) {
    return;
  }
  event.preventDefault();
  for (const [axis, value] of values.slice(0, COORDINATE_COUNT).entries()) {
    target[axis] = value;
  }
}

export { parseCoordinates, pasteCoordinates };
