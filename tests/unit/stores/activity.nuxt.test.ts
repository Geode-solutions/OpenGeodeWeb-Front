// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";

// Local imports
import { MAX_ENTRIES, isFailure, useActivityStore } from "@ogw_front/stores/activity";
import { setupActivePinia } from "@ogw_tests/utils";

vi.setConfig({ testTimeout: 10_000 });

const FIRST_INDEX = 0;

const request = { source: "back", kind: "http", route: "opengeodeweb_back/test" } as const;

describe("activity store", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("a request goes from running to success", () => {
    const activityStore = useActivityStore();
    const entryId = activityStore.start_request({ ...request, params: { id: "123" } });
    expect(activityStore.running).toHaveLength(1);
    expect(activityStore.entries[FIRST_INDEX]).toMatchObject({
      status: "running",
      params: '{"id":"123"}',
    });
    activityStore.finish_request(entryId, { status: "success" });
    expect(activityStore.running).toHaveLength(0);
    expect(activityStore.entries[FIRST_INDEX]?.status).toBe("success");
    expect(activityStore.unseen_errors).toBe(0);
  });

  test("a finished request has a duration", () => {
    const activityStore = useActivityStore();
    const entryId = activityStore.start_request(request);
    activityStore.finish_request(entryId, { status: "success" });
    expect(activityStore.entries[FIRST_INDEX]?.duration_ms).toBeGreaterThanOrEqual(0);
  });

  test("errors and timeouts are failures", () => {
    expect(isFailure("error")).toBe(true);
    expect(isFailure("timeout")).toBe(true);
    expect(isFailure("success")).toBe(false);
    expect(isFailure("running")).toBe(false);
    expect(isFailure("info")).toBe(false);
  });

  test("failures are counted until seen", () => {
    const activityStore = useActivityStore();
    const entryId = activityStore.start_request(request);
    activityStore.finish_request(entryId, { status: "error", error: "Boom" });
    activityStore.log({ ...request, status: "timeout", error: "Too slow" });
    expect(activityStore.error_count).toBe(2);
    expect(activityStore.unseen_errors).toBe(2);
    activityStore.mark_errors_seen();
    expect(activityStore.unseen_errors).toBe(0);
    expect(activityStore.error_count).toBe(2);
  });

  test("finishing an unknown request does nothing", () => {
    const activityStore = useActivityStore();
    activityStore.finish_request(-1, { status: "error", error: "Boom" });
    expect(activityStore.entries).toHaveLength(0);
    expect(activityStore.unseen_errors).toBe(0);
  });

  test("only the last entries are kept", () => {
    const activityStore = useActivityStore();
    for (let index = 0; index <= MAX_ENTRIES; index += 1) {
      activityStore.log({ ...request, status: "success", label: String(index) });
    }
    expect(activityStore.entries).toHaveLength(MAX_ENTRIES);
    expect(activityStore.entries[FIRST_INDEX]?.label).toBe("1");
  });

  test("clear keeps the running requests", () => {
    const activityStore = useActivityStore();
    activityStore.log({ ...request, status: "error", error: "Boom" });
    activityStore.start_request(request);
    activityStore.clear();
    expect(activityStore.entries).toHaveLength(1);
    expect(activityStore.entries[FIRST_INDEX]?.status).toBe("running");
    expect(activityStore.unseen_errors).toBe(0);
  });
});
