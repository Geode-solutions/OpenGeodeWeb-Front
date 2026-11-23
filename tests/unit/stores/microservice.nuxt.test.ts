// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Local imports
import {
  useMicroserviceVersion,
  usePing,
  useRequestCounter,
} from "@ogw_internal/stores/microservice";
import type { MicroserviceVersionSchema } from "@ogw_shared/utils/types.js";

const PING_INTERVAL_MILLISECONDS = 1000;
const THREE_INTERVALS_MILLISECONDS = 3000;
const PINGS_AFTER_START = 1;
const PINGS_AFTER_THREE_INTERVALS = 4;
const VERSION = "1.2.3";

type VersionRequest = Parameters<typeof useMicroserviceVersion>[0];

describe("request counter", () => {
  test("is busy while a request is running", () => {
    const counter = useRequestCounter();
    expect(counter.is_busy.value).toBe(false);
    counter.start_request();
    expect(counter.request_counter.value).toBe(1);
    expect(counter.is_busy.value).toBe(true);
    counter.stop_request();
    expect(counter.is_busy.value).toBe(false);
  });
});

describe("ping loop", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("pings at once, then at each interval", () => {
    const ping = vi.fn<() => Promise<unknown>>().mockResolvedValue(undefined);
    const { start_ping, stop_ping } = usePing(ping, PING_INTERVAL_MILLISECONDS);
    start_ping();
    expect(ping).toHaveBeenCalledTimes(PINGS_AFTER_START);
    vi.advanceTimersByTime(THREE_INTERVALS_MILLISECONDS);
    expect(ping).toHaveBeenCalledTimes(PINGS_AFTER_THREE_INTERVALS);
    stop_ping();
  });

  test("starting again keeps a single loop", () => {
    const ping = vi.fn<() => Promise<unknown>>().mockResolvedValue(undefined);
    const { start_ping, stop_ping } = usePing(ping, PING_INTERVAL_MILLISECONDS);
    start_ping();
    start_ping();
    start_ping();
    ping.mockClear();
    vi.advanceTimersByTime(THREE_INTERVALS_MILLISECONDS);
    expect(ping).toHaveBeenCalledTimes(THREE_INTERVALS_MILLISECONDS / PING_INTERVAL_MILLISECONDS);
    stop_ping();
  });

  test("stop ends the loop", () => {
    const ping = vi.fn<() => Promise<unknown>>().mockResolvedValue(undefined);
    const { start_ping, stop_ping } = usePing(ping, PING_INTERVAL_MILLISECONDS);
    start_ping();
    stop_ping();
    ping.mockClear();
    vi.advanceTimersByTime(THREE_INTERVALS_MILLISECONDS);
    expect(ping).not.toHaveBeenCalled();
  });
});

describe("microservice version", () => {
  const schema: MicroserviceVersionSchema = { $id: "test/microservice_version" };

  test("stores the version answered", async () => {
    const request = vi.fn<VersionRequest>(async (_args, callbacks) => {
      const response = { microservice_version: VERSION };
      await callbacks.response_function?.(response);
      return response;
    });
    const { version, get_version } = useMicroserviceVersion(request);
    await get_version(schema);
    expect(version.value).toBe(VERSION);
  });

  test("without schema, nothing is requested", async () => {
    const request = vi.fn<VersionRequest>();
    const { version, get_version } = useMicroserviceVersion(request);
    await expect(get_version(undefined)).resolves.toBeUndefined();
    expect(request).not.toHaveBeenCalled();
    expect(version.value).toBe("0.0.0");
  });
});
