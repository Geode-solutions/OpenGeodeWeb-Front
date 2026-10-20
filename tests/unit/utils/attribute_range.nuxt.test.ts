// Third party imports
import { describe, expect, test, vi } from "vitest";

// Local imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { fetchAttributeRange } from "@ogw_front/utils/attribute_range";

const RANGE = { min_values: [0], max_values: [1], no_data: false };
const MISSING_ATTRIBUTE = "missing";
let nbRequests = 0;

type BackRequest = (request: { params: { attribute_name: string } }) => Promise<typeof RANGE>;

vi.mock(import("@ogw_front/stores/back") as Promise<unknown>, () => ({
  useBackStore: (): { request: BackRequest } => ({
    request: async ({ params }): Promise<typeof RANGE> => {
      nbRequests += 1;
      if (params.attribute_name === MISSING_ATTRIBUTE) {
        throw new Error("Attribute not found");
      }
      const range = await Promise.resolve(RANGE);
      return range;
    },
  }),
}));

describe("attribute range", () => {
  test("shares one back request for the same attribute", async () => {
    const schema = back_schemas.opengeodeweb_back.vertex_attribute_range;
    const ranges = await Promise.all([
      fetchAttributeRange(schema, { id: "id" }, "porosity"),
      fetchAttributeRange(schema, { id: "id" }, "porosity"),
    ]);
    await fetchAttributeRange(schema, { id: "id" }, "porosity");

    expect(ranges).toStrictEqual([RANGE, RANGE]);
    expect(nbRequests).toBe(1);
  });

  test("rethrows a failed back request and retries it on the next call", async () => {
    const schema = back_schemas.opengeodeweb_back.vertex_attribute_range;
    const nbRequestsBefore = nbRequests;
    await expect(fetchAttributeRange(schema, { id: "id" }, MISSING_ATTRIBUTE)).rejects.toThrow(
      "Attribute not found",
    );
    await expect(fetchAttributeRange(schema, { id: "id" }, MISSING_ATTRIBUTE)).rejects.toThrow(
      "Attribute not found",
    );

    expect(nbRequests).toBe(nbRequestsBefore + 2);
  });
});
