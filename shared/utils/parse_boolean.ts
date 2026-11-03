const TRUTHY_VALUES = new Set([true, 1, "1", "true", "yes"]);
const FALSY_VALUES = new Set([false, 0, "0", "false", "no"]);

function parseBoolean(value: string | number | boolean): boolean {
  let normalized: string | number | boolean = value;
  if (typeof value === "string") {
    normalized = value.trim().toLowerCase();
  }

  if (TRUTHY_VALUES.has(normalized)) {
    return true;
  }
  if (FALSY_VALUES.has(normalized)) {
    return false;
  }
  throw new Error(`Cannot parse boolean from: ${value}`);
}

export { parseBoolean };
