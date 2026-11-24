// Third party imports
import { describe, expect, test, vi } from "vitest";

// Local imports
import { isPortInUseError } from "@geode/opengeodeweb-front/server/utils/microservices_process.ts";

vi.setConfig({ testTimeout: 10_000 });

describe("taken port detection", () => {
  test("detects a taken port on linux and macos", () => {
    expect(isPortInUseError(new Error("OSError: [Errno 98] Address already in use"))).toBe(true);
    expect(isPortInUseError(new Error("listen EADDRINUSE: address already in use"))).toBe(true);
  });

  test("detects a taken port on windows", () => {
    const error = new Error(
      "OSError: [Errno 10048] error while attempting to bind on address ('127.0.0.1', 56583): [winerror 10048] only one usage of each socket address (protocol/network address/port) is normally permitted",
    );
    expect(isPortInUseError(error)).toBe(true);
  });

  test("ignores other errors", () => {
    expect(isPortInUseError(new Error("exited with code 1 before becoming ready."))).toBe(false);
  });
});
