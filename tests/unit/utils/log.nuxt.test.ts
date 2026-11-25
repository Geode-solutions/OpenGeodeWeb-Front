// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { consola } from "consola";

// Local imports
import { endRequestLog, startRequestLog } from "@ogw_front/utils/log";

vi.setConfig({ testTimeout: 10_000 });

const YEAR = 2026;
const HOURS = 12;
const MINUTES = 0;
const SECONDS = 59;
const MILLISECONDS = 500;
const DURATION_MS = 1200;
const DURATION_S = 1.2;
const DURATION_INDEX = 3;

const schema = { $id: "opengeodeweb_back/test", type: "object", properties: {} };

describe("request log", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("the duration is right across a minute", () => {
    const info = vi.spyOn(consola, "info").mockReturnValue(undefined);
    vi.setSystemTime(new Date(YEAR, 0, 1, HOURS, MINUTES, SECONDS, MILLISECONDS));
    const startedAt = startRequestLog({ $id: "back" }, schema);
    vi.advanceTimersByTime(DURATION_MS);
    endRequestLog({ $id: "back" }, schema, startedAt);
    expect(info.mock.lastCall?.[DURATION_INDEX]).toBe(DURATION_S);
  });
});
