// oxlint-disable vitest/require-mock-type-parameters
// Third party imports
import { describe, expect, test, vi } from "vitest";

// Local imports
import { fetchSources } from "@ogw_front/utils/threshold_sources";
import { mockAs } from "@ogw_tests/utils";
import type { useDataStore } from "@ogw_front/stores/data";

vi.setConfig({ testTimeout: 10_000 });

function dataStoreWith(item: Record<string, string>): ReturnType<typeof useDataStore> {
  return mockAs<ReturnType<typeof useDataStore>>({ item: vi.fn().mockResolvedValue(item) });
}

describe("threshold sources", () => {
  test.each(["RasterImage2D", "RasterImage3D"])(
    "a %s has no attribute to threshold",
    async (type) => {
      const dataStore = dataStoreWith({ viewer_object_type: "image", geode_object_type: type });

      await expect(fetchSources(dataStore, "image")).resolves.toStrictEqual([]);
    },
  );

  test("a mesh thresholds its vertex and element attributes", async () => {
    const dataStore = dataStoreWith({
      viewer_object_type: "mesh",
      geode_object_type: "TriangulatedSurface3D",
    });

    const sources = await fetchSources(dataStore, "mesh");

    expect(sources.map((source) => source.location)).toStrictEqual(["point", "cell"]);
  });
});
