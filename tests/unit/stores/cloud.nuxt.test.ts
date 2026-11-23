// Third party imports
import { beforeEach, describe, expect, expectTypeOf, test } from "vitest";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { setupActivePinia } from "@ogw_tests/utils";
import { useCloudStore } from "@ogw_front/stores/cloud";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

describe("cloud store", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  describe("state", () => {
    test("initial state", () => {
      const cloudStore = useCloudStore();
      expectTypeOf(cloudStore.status).toBeString();
      expect(cloudStore.status).toBe(Status.NOT_CONNECTED);
    });
  });

  describe("actions", () => {
    test("set_connecting", () => {
      const cloudStore = useCloudStore();
      cloudStore.set_connecting();
      expect(cloudStore.status).toBe(Status.CONNECTING);
    });

    test("set_connected sets the status and clears the server error", () => {
      const cloudStore = useCloudStore();
      const feedbackStore = useFeedbackStore();
      feedbackStore.set_server_error(true);
      cloudStore.set_connected(true);
      expect(cloudStore.status).toBe(Status.CONNECTED);
      expect(feedbackStore.server_error).toBe(false);
    });

    test("set_connected false sets the status and the server error", () => {
      const cloudStore = useCloudStore();
      const feedbackStore = useFeedbackStore();
      cloudStore.set_connected(false);
      expect(cloudStore.status).toBe(Status.NOT_CONNECTED);
      expect(feedbackStore.server_error).toBe(true);
    });
  });
});
