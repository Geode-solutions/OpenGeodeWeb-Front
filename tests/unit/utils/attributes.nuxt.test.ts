// Third party imports
import { describe, expect, test } from "vitest";

// Local imports
import { intersectAttributes } from "@ogw_front/utils/attributes";

describe("attributes intersection", () => {
  test("keeps only the attributes shared by every data", () => {
    const common = intersectAttributes([
      [
        { attribute_name: "porosity", nb_items: 1 },
        { attribute_name: "depth", nb_items: 1 },
      ],
      [{ attribute_name: "porosity", nb_items: 1 }],
    ]);

    expect(common.map((attribute) => attribute.attribute_name)).toStrictEqual(["porosity"]);
  });

  test("keeps the smallest number of items of a shared attribute", () => {
    const common = intersectAttributes([
      [{ attribute_name: "velocity", nb_items: 3 }],
      [{ attribute_name: "velocity", nb_items: 2 }],
    ]);

    expect(common).toStrictEqual([{ attribute_name: "velocity", nb_items: 2 }]);
  });

  test("returns no attribute when a data has none", () => {
    const common = intersectAttributes([[{ attribute_name: "porosity", nb_items: 1 }], []]);

    expect(common).toStrictEqual([]);
  });

  test("returns no attribute when there is no data", () => {
    expect(intersectAttributes([])).toStrictEqual([]);
  });
});
