import { middleTruncate } from "@ogw_front/utils/string";
import type { MaybeRefOrGetter } from "vue";

const UUID_END_CHARS = 12;
const ELLIPSIS_LENGTH = 3;
const MIN_START_CHARS = 4;
const DEFAULT_ESTIMATED_CHAR_WIDTH = 8.5;

interface ResponsiveMiddleTruncateOptions {
  estimatedCharWidth?: number;
  uuidEndChars?: number;
  ellipsisLength?: number;
  minStartChars?: number;
}

export function useResponsiveMiddleTruncate(
  textRef: MaybeRefOrGetter<string | undefined | null>,
  containerWidthRef: MaybeRefOrGetter<number | undefined>,
  options: ResponsiveMiddleTruncateOptions = {},
) {
  const {
    estimatedCharWidth = DEFAULT_ESTIMATED_CHAR_WIDTH,
    uuidEndChars = UUID_END_CHARS,
    ellipsisLength = ELLIPSIS_LENGTH,
    minStartChars = MIN_START_CHARS,
  } = options;

  return computed(() => {
    const text = toValue(textRef);
    if (!text) {
      return "";
    }

    const width = toValue(containerWidthRef) || 0;
    const maxChars = Math.floor(width / estimatedCharWidth);

    if (maxChars <= 0 || text.length <= maxChars) {
      return text;
    }

    const endChars = Math.min(uuidEndChars, Math.floor(maxChars / ellipsisLength));
    const startChars = Math.max(minStartChars, maxChars - endChars - ellipsisLength);

    return middleTruncate(text, maxChars, startChars, endChars);
  });
}
