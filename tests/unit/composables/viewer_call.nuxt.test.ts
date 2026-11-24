// Third party imports
import { beforeEach, describe, expect, test } from "vitest";
import { setTimeout as sleep } from "node:timers/promises";

// Local imports
import type { RpcClient } from "@ogw_shared/utils/call_raw.js";
import { setupActivePinia } from "@ogw_tests/utils";
import { useConsoleStore } from "@ogw_front/stores/console";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { viewer_call } from "@ogw_internal/utils/viewer_call";

const FIRST_INDEX = 0;
const WSLINK_EXCEPTION = -32_603;
const SHORT_TIMEOUT_MS = 10;
const NEVER_MS = 1000;

const schema = {
  $id: "opengeodeweb_viewer.test",
  rpc: "test",
  type: "object",
  properties: {},
  additionalProperties: false,
};

function fakeViewer(call: () => Promise<unknown>): {
  $id: string;
  base_url: string;
  request_counter: number;
  client: RpcClient;
  start_request: () => void;
  stop_request: () => void;
} {
  const client: RpcClient = { call, getConnection: () => ({ getSession: () => ({ call }) }) };
  return {
    $id: "viewer",
    base_url: "",
    request_counter: 0,
    client,
    start_request(): void {
      this.request_counter += 1;
    },
    stop_request(): void {
      this.request_counter -= 1;
    },
  };
}

describe("viewer_call()", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("wslink exception is reported once with its message", async () => {
    const feedbackStore = useFeedbackStore();
    const error = {
      code: WSLINK_EXCEPTION,
      message: "Exception raised",
      data: { method: "test", exception: "ValueError('Data not found')", trace: "" },
    };
    const viewer = fakeViewer(async () => {
      await Promise.resolve();
      // oxlint-disable-next-line typescript/only-throw-error -- wslink rejects with a plain { code, message, data } object
      throw error;
    });
    let response_errors = 0;
    await expect(
      viewer_call(
        viewer,
        { schema },
        {
          response_error_function: () => {
            response_errors += 1;
          },
        },
      ),
    ).rejects.toStrictEqual(error);
    expect(response_errors).toBe(1);
    expect(viewer.request_counter).toBe(0);
    expect(feedbackStore.feedbacks).toHaveLength(1);
    expect(feedbackStore.feedbacks[FIRST_INDEX]).toMatchObject({
      type: "error",
      route: schema.$id,
      name: "ValueError",
      description: "Data not found",
    });
  });

  test("timeout is reported", async () => {
    const feedbackStore = useFeedbackStore();
    const viewer = fakeViewer(async () => {
      await sleep(NEVER_MS);
    });
    await expect(viewer_call(viewer, { schema, timeout: SHORT_TIMEOUT_MS })).rejects.toThrow(
      "Timed out",
    );
    expect(feedbackStore.feedbacks).toHaveLength(1);
    expect(feedbackStore.feedbacks[FIRST_INDEX]).toMatchObject({
      name: "TimeoutError",
      description: `${schema.$id}: Timed out after ${SHORT_TIMEOUT_MS}ms`,
    });
  });

  test("a successful call is mirrored in the console", async () => {
    const consoleStore = useConsoleStore();
    let runningDuringCall = 0;
    const viewer = fakeViewer(async () => {
      runningDuringCall = consoleStore.running.length;
      await Promise.resolve();
      return {};
    });
    await viewer_call(viewer, { schema, params: {} });
    expect(runningDuringCall).toBe(1);
    expect(consoleStore.entries).toHaveLength(1);
    expect(consoleStore.entries[FIRST_INDEX]).toMatchObject({
      source: "viewer",
      kind: "ws",
      route: schema.$id,
      status: "success",
    });
    expect(consoleStore.entries[FIRST_INDEX]?.duration_ms).toBeGreaterThanOrEqual(0);
  });

  test("a timeout is mirrored in the console", async () => {
    const consoleStore = useConsoleStore();
    const viewer = fakeViewer(async () => {
      await sleep(NEVER_MS);
    });
    await expect(viewer_call(viewer, { schema, timeout: SHORT_TIMEOUT_MS })).rejects.toThrow(
      "Timed out",
    );
    expect(consoleStore.entries[FIRST_INDEX]).toMatchObject({ status: "timeout" });
    expect(consoleStore.unseen_errors).toBe(1);
  });
});
