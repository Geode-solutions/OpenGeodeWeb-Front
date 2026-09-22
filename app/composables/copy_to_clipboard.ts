import { useClipboard } from "@vueuse/core";

const COPIED_FEEDBACK_TIMEOUT = 1500;

export function useCopyToClipboard(): ReturnType<typeof useClipboard> {
  return useClipboard({ copiedDuring: COPIED_FEEDBACK_TIMEOUT });
}
