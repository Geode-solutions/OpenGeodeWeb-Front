// Request params shown in the console: a short JSON, never the whole payload (id lists, styles, files...)
const MAX_ARRAY_ITEMS = 10;
const MAX_STRING_LENGTH = 120;
const MAX_SUMMARY_LENGTH = 400;
const ELLIPSIS = "…";

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}${ELLIPSIS}` : text;
}

function shorten(_key: string, value: unknown): unknown {
  if (typeof value === "string") {
    return truncate(value, MAX_STRING_LENGTH);
  }
  if (Array.isArray(value) && value.length > MAX_ARRAY_ITEMS) {
    const items: unknown[] = value.slice(0, MAX_ARRAY_ITEMS);
    return [...items, `${ELLIPSIS} +${value.length - MAX_ARRAY_ITEMS}`];
  }
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return `<${value.size} bytes>`;
  }
  return value;
}

function summarizeParams(params: unknown): string | undefined {
  if (params === undefined || params === null) {
    return undefined;
  }
  if (typeof params === "object" && Object.keys(params).length === 0) {
    return undefined;
  }
  try {
    const json = JSON.stringify(params, shorten);
    return truncate(json, MAX_SUMMARY_LENGTH);
  } catch {
    return "<unserializable params>";
  }
}

export { summarizeParams };
