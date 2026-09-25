import { type UseClipboardReturn, useClipboard } from "@vueuse/core";

const COPIED_FEEDBACK_TIMEOUT = 1500;

export function useCopyToClipboard(): UseClipboardReturn<false> {
  return useClipboard({ copiedDuring: COPIED_FEEDBACK_TIMEOUT });
}
