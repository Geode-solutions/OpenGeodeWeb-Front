// Third party imports
import { afterEach, describe, expect, test } from "vitest";

// Local imports
import { clearCloudUrlParam, getCloudUrlParam } from "@ogw_front/utils/cloud";

// CONSTANTS
const CLOUD_RUN_HOST = "vease-abc123.europe-west1.run.app";

function setCloudUrlParam(value?: string): void {
  const search = value === undefined ? "" : `?cloud_url=${encodeURIComponent(value)}`;
  globalThis.history.replaceState(undefined, "", `/${search}`);
}

describe("cloud_url query param parsing", () => {
  afterEach(() => {
    setCloudUrlParam();
  });

  test("missing", () => {
    setCloudUrlParam();
    expect(getCloudUrlParam()).toBeUndefined();
  });

  test("bare Cloud Run host", () => {
    setCloudUrlParam(CLOUD_RUN_HOST);
    expect(getCloudUrlParam()).toBe(CLOUD_RUN_HOST);
  });

  test("full Cloud Run URL", () => {
    setCloudUrlParam(`https://${CLOUD_RUN_HOST}/some/path?query=1`);
    expect(getCloudUrlParam()).toBe(CLOUD_RUN_HOST);
  });

  test("non Cloud Run host", () => {
    setCloudUrlParam("evil.com");
    expect(getCloudUrlParam()).toBeUndefined();
  });

  test("host only ending like Cloud Run", () => {
    setCloudUrlParam("evilrun.app");
    expect(getCloudUrlParam()).toBeUndefined();
  });

  test("invalid URL", () => {
    setCloudUrlParam("https://");
    expect(getCloudUrlParam()).toBeUndefined();
  });
});

describe("cloud_url query param clearing", () => {
  afterEach(() => {
    setCloudUrlParam();
  });

  test("removes cloud_url and keeps other params", () => {
    globalThis.history.replaceState(undefined, "", `/?foo=1&cloud_url=${CLOUD_RUN_HOST}`);
    clearCloudUrlParam();
    expect(globalThis.location.search).toBe("?foo=1");
    expect(getCloudUrlParam()).toBeUndefined();
  });
});
