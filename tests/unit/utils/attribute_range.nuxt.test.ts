// Third party imports
import { describe, expect, test, vi } from "vitest";

// Local imports
import { fetchAttributeRange } from "@ogw_front/utils/attribute_range";

const RANGE = { min_values: [0], max_values: [1], no_data: false };
let nbRequests = 0;

vi.mock(import("@ogw_front/stores/back") as Promise<unknown>, () => ({
  useBackStore: (): { request: () => Promise<typeof RANGE> } => ({
    request: async (): Promise<typeof RANGE> => {
      nbRequests += 1;
      const range = await Promise.resolve(RANGE);
      return range;
    },
  }),
}));

describe("attribute range", () => {
  test("shares one back request for the same attribute", async () => {
    const ranges = await Promise.all([
      fetchAttributeRange("vertex", { id: "id" }, "porosity"),
      fetchAttributeRange("vertex", { id: "id" }, "porosity"),
    ]);
    await fetchAttributeRange("vertex", { id: "id" }, "porosity");

    expect(ranges).toStrictEqual([RANGE, RANGE]);
    expect(nbRequests).toBe(1);
  });
});
