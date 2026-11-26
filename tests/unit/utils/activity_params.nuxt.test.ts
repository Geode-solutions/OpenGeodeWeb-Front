// Third party imports
import { describe, expect, test, vi } from "vitest";

// Local imports
import { summarizeParams } from "@ogw_front/utils/activity_params";

vi.setConfig({ testTimeout: 10_000 });

const LONG_LENGTH = 50;
const MAX_SUMMARY_LENGTH = 401;
const MAX_STRING_LENGTH = 121;

describe("summarizeParams()", () => {
  test("empty params give no summary", () => {
    expect(summarizeParams({})).toBeUndefined();
    expect(summarizeParams(undefined)).toBeUndefined();
  });

  test("small params are kept as JSON", () => {
    expect(summarizeParams({ id: "123", visible: true })).toBe('{"id":"123","visible":true}');
  });

  test("long arrays are cut", () => {
    const ids = Array.from({ length: LONG_LENGTH }, (_value, index) => index);
    expect(summarizeParams({ ids })).toBe('{"ids":[0,1,2,3,4,5,6,7,8,9,"… +40"]}');
  });

  test("long strings are cut", () => {
    const summary = summarizeParams({ text: "a".repeat(LONG_LENGTH * LONG_LENGTH) });
    expect(summary).toBe(`{"text":"${"a".repeat(MAX_STRING_LENGTH - 1)}…"}`);
  });

  test("the summary has a bounded length", () => {
    const list = Array.from({ length: LONG_LENGTH }, () => "b".repeat(LONG_LENGTH));
    const summary = summarizeParams({ list, other: list.slice(1), more: list.slice(2) });
    expect(summary?.length).toBeLessThanOrEqual(MAX_SUMMARY_LENGTH);
  });
});
