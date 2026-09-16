import { middleTruncate } from "@ogw_front/utils/string";

const UUID_END_CHARS = 12;
const ELLIPSIS_LENGTH = 3;
const MIN_START_CHARS = 4;
const DEFAULT_ESTIMATED_CHAR_WIDTH = 8.5;

interface ResponsiveMiddleTruncateOptions {
  readonly estimatedCharWidth?: number;
  readonly uuidEndChars?: number;
  readonly ellipsisLength?: number;
  readonly minStartChars?: number;
}

// Only the Ref member is wrapped in Readonly<>, so the callable getter member keeps a usable signature.
type ReadonlyMaybeRefOrGetter<Value> = Value | Readonly<Ref<Value>> | (() => Value);

export function useResponsiveMiddleTruncate(
  textRef: ReadonlyMaybeRefOrGetter<string | undefined | null>,
  containerWidthRef: ReadonlyMaybeRefOrGetter<number | undefined>,
  options: Readonly<ResponsiveMiddleTruncateOptions> = {},
): ComputedRef<string> {
  const {
    estimatedCharWidth = DEFAULT_ESTIMATED_CHAR_WIDTH,
    uuidEndChars = UUID_END_CHARS,
    ellipsisLength = ELLIPSIS_LENGTH,
    minStartChars = MIN_START_CHARS,
  } = options;

  return computed(() => {
    const text = toValue(textRef);
    if (text === undefined || text === null || text === "") {
      return "";
    }

    const width = toValue(containerWidthRef) ?? 0;
    const maxChars = Math.floor(width / estimatedCharWidth);

    if (maxChars <= 0 || text.length <= maxChars) {
      return text;
    }

    const endChars = Math.min(uuidEndChars, Math.floor(maxChars / ellipsisLength));
    const startChars = Math.max(minStartChars, maxChars - endChars - ellipsisLength);

    return middleTruncate(text, maxChars, startChars, endChars) ?? "";
  });
}
