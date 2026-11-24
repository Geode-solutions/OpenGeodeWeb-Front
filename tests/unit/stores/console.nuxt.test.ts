// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";

// Local imports
import { MAX_ENTRIES, useConsoleStore } from "@ogw_front/stores/console";
import { setupActivePinia } from "@ogw_tests/utils";

vi.setConfig({ testTimeout: 10_000 });

const FIRST_INDEX = 0;

const request = { source: "back", kind: "http", route: "opengeodeweb_back/test" } as const;

describe("console store", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("a request goes from running to success", () => {
    const consoleStore = useConsoleStore();
    const entryId = consoleStore.start_request({ ...request, params: { id: "123" } });
    expect(consoleStore.running).toHaveLength(1);
    expect(consoleStore.entries[FIRST_INDEX]).toMatchObject({
      status: "running",
      params: '{"id":"123"}',
    });
    consoleStore.finish_request(entryId, { status: "success" });
    expect(consoleStore.running).toHaveLength(0);
    expect(consoleStore.entries[FIRST_INDEX]?.status).toBe("success");
    expect(consoleStore.unseen_errors).toBe(0);
  });

  test("a finished request has a duration", () => {
    const consoleStore = useConsoleStore();
    const entryId = consoleStore.start_request(request);
    consoleStore.finish_request(entryId, { status: "success" });
    expect(consoleStore.entries[FIRST_INDEX]?.duration_ms).toBeGreaterThanOrEqual(0);
  });

  test("failures are counted until seen", () => {
    const consoleStore = useConsoleStore();
    const entryId = consoleStore.start_request(request);
    consoleStore.finish_request(entryId, { status: "error", error: "Boom" });
    consoleStore.log({ ...request, status: "timeout", error: "Too slow" });
    expect(consoleStore.error_count).toBe(2);
    expect(consoleStore.unseen_errors).toBe(2);
    consoleStore.mark_errors_seen();
    expect(consoleStore.unseen_errors).toBe(0);
    expect(consoleStore.error_count).toBe(2);
  });

  test("finishing an unknown request does nothing", () => {
    const consoleStore = useConsoleStore();
    consoleStore.finish_request(-1, { status: "error", error: "Boom" });
    expect(consoleStore.entries).toHaveLength(0);
    expect(consoleStore.unseen_errors).toBe(0);
  });

  test("only the last entries are kept", () => {
    const consoleStore = useConsoleStore();
    for (let index = 0; index <= MAX_ENTRIES; index += 1) {
      consoleStore.log({ ...request, status: "success", label: String(index) });
    }
    expect(consoleStore.entries).toHaveLength(MAX_ENTRIES);
    expect(consoleStore.entries[FIRST_INDEX]?.label).toBe("1");
  });

  test("clear keeps the running requests", () => {
    const consoleStore = useConsoleStore();
    consoleStore.log({ ...request, status: "error", error: "Boom" });
    consoleStore.start_request(request);
    consoleStore.clear();
    expect(consoleStore.entries).toHaveLength(1);
    expect(consoleStore.entries[FIRST_INDEX]?.status).toBe("running");
    expect(consoleStore.unseen_errors).toBe(0);
  });
});
