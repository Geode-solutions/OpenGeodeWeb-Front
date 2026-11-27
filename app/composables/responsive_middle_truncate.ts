import type { DisplayText, Pixels } from "@ogw_front/types/ui";
import type { ReadonlyMaybeRefOrGetter } from "@ogw_front/composables/virtual_tree_types";
import { middleTruncate } from "@ogw_front/utils/string";

const UUID_END_CHARS = 12;
const ELLIPSIS_LENGTH = 3;
const MIN_START_CHARS = 4;
const DEFAULT_ESTIMATED_CHAR_WIDTH = 8.5;

interface ResponsiveMiddleTruncateOptions {
  readonly estimatedCharWidth?: Pixels;
  readonly uuidEndChars?: number;
  readonly ellipsisLength?: number;
  readonly minStartChars?: number;
}

export function useResponsiveMiddleTruncate(
  textRef: ReadonlyMaybeRefOrGetter<DisplayText | undefined | null>,
  containerWidthRef: ReadonlyMaybeRefOrGetter<Pixels | undefined>,
  options: ResponsiveMiddleTruncateOptions = {},
): ComputedRef<DisplayText> {
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
