// Third party imports
import { describe, expect, test, vi } from "vitest";

// Local imports
import { TIMEOUT, setupViewerEnvironment } from "@ogw_tests/unit/stores/viewer_helpers";
import type { ViewerRequest } from "@ogw_front/stores/viewer_helpers/request";
import { mockAs } from "@ogw_tests/utils";
import { showRenderingWarnings } from "@ogw_front/stores/viewer_helpers/actions";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const WARNING = "Rendering without the GPU";

describe("viewer rendering warnings", () => {
  setupViewerEnvironment();

  test(
    "shows each warning",
    async () => {
      const request = mockAs<ViewerRequest>(vi.fn().mockResolvedValue({ warnings: [WARNING] }));
      await showRenderingWarnings(request);
      const feedbackStore = useFeedbackStore();
      expect(feedbackStore.feedbacks).toHaveLength(1);
      expect(feedbackStore.feedbacks[0]?.type).toBe("warning");
      expect(feedbackStore.feedbacks[0]?.description).toBe(WARNING);
    },
    TIMEOUT,
  );

  test(
    "no warning",
    async () => {
      const request = mockAs<ViewerRequest>(vi.fn().mockResolvedValue({ warnings: [] }));
      await showRenderingWarnings(request);
      expect(useFeedbackStore().feedbacks).toHaveLength(0);
    },
    TIMEOUT,
  );
});
