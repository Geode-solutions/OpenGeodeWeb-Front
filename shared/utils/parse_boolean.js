const TRUTHY_VALUES = new Set([true, 1, "1", "true", "yes"]);
const FALSY_VALUES = new Set([false, 0, "0", "false", "no"]);

function parseBoolean(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : value;

  if (TRUTHY_VALUES.has(normalized)) {
    return true;
  }
  if (FALSY_VALUES.has(normalized)) {
    return false;
  }
  throw new Error(`Cannot parse boolean from: ${value}`);
}

export { parseBoolean };
