// oxlint-disable no-magic-numbers
// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";

// Local imports
import type { PhysicalPropertyNode } from "@ogw_front/utils/physical_properties_tree";
import { usePhysicalPropertyColoring } from "@ogw_front/composables/physical_property_coloring";

const MODEL_ID = "model";
const BLOCK_IDS = ["block-1", "block-2"];

const style = { activeColoring: "constant", attributeName: "" };
const setAttribute = vi.fn<(modelId: string, ids: string[], input: unknown) => Promise<void>>();
const setActiveColoring = vi.fn<(modelId: string, ids: string[], coloring: string) => void>();
const remoteRender = vi.fn<() => undefined>();

vi.mock(import("@ogw_front/stores/data_style") as Promise<unknown>, () => ({
  useDataStyleStore: (): Record<string, unknown> => ({
    modelBlockActiveColoring: (): string => style.activeColoring,
    modelBlocksPolyhedronAttributeName: (): string => style.attributeName,
    setModelBlocksPolyhedronAttribute: setAttribute,
    setModelBlocksActiveColoring: setActiveColoring,
  }),
}));
vi.mock(import("@ogw_front/stores/hybrid_viewer") as Promise<unknown>, () => ({
  useHybridViewerStore: (): Record<string, unknown> => ({ remoteRender }),
}));

const POROSITY_NODE: PhysicalPropertyNode = {
  id: "physical_properties:porosity",
  title: "Porosity (2)",
  physical_property: "porosity",
  attribute_name: "porosity_attribute",
  element_type: "polyhedron",
  component_type: "Block",
  coloring: { item: 0, minimum: 0.05, maximum: 0.3 },
  children: BLOCK_IDS.map((id) => ({
    id,
    geode_id: id,
    title: id,
    category: "Block",
    viewer_id: 0,
    is_active: true,
    physical_value: "0.05",
  })),
};

describe("physical property coloring", () => {
  beforeEach(() => {
    style.activeColoring = "constant";
    style.attributeName = "";
    vi.clearAllMocks();
  });

  test("colors the components carrying the property by its attribute", async () => {
    const { isColoredBy, toggleColoring } = usePhysicalPropertyColoring(MODEL_ID);
    expect(isColoredBy(POROSITY_NODE)).toBe(false);

    await toggleColoring(POROSITY_NODE);

    expect(setAttribute).toHaveBeenCalledWith(MODEL_ID, BLOCK_IDS, {
      name: "porosity_attribute",
      item: 0,
      minimum: 0.05,
      maximum: 0.3,
      colorMap: "batlow",
    });
    expect(setActiveColoring).toHaveBeenCalledWith(MODEL_ID, BLOCK_IDS, "polyhedron");
    expect(remoteRender).toHaveBeenCalledWith();
  });

  test("a second click gives the components their constant color back", async () => {
    style.activeColoring = "polyhedron";
    style.attributeName = "porosity_attribute";
    const { isColoredBy, toggleColoring } = usePhysicalPropertyColoring(MODEL_ID);
    expect(isColoredBy(POROSITY_NODE)).toBe(true);

    await toggleColoring(POROSITY_NODE);

    expect(setAttribute).not.toHaveBeenCalled();
    expect(setActiveColoring).toHaveBeenCalledWith(MODEL_ID, BLOCK_IDS, "constant");
  });

  test("another attribute of the same element is not this property coloring", () => {
    style.activeColoring = "polyhedron";
    style.attributeName = "other";
    const { isColoredBy } = usePhysicalPropertyColoring(MODEL_ID);
    expect(isColoredBy(POROSITY_NODE)).toBe(false);
  });
});
