import { describe, expect, test } from "vitest";
import {
  physicalPropertyNodes,
  searchPhysicalProperties,
  sortPhysicalPropertyLeaves,
} from "@ogw_front/utils/physical_properties_tree";
import type { FormattedComponent } from "@ogw_internal/stores/data/model/mesh_components";
import type { PhysicalProperty } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";

const BLOCK_ID = "block-1";
const SURFACE_ID = "surface-1";
const SECOND_SURFACE_ID = "surface-2";
const POROSITY = 0.05;
const BOUNDARY_PRESSURE = 2e7;

function formattedComponent(id: string, title: string, category: string): FormattedComponent {
  return { id, geode_id: id, title, category, viewer_id: 0, is_active: true };
}

function physicalProperty(
  name: string,
  componentType: string,
  elementType: string,
  componentIds: string[],
  value: number,
): PhysicalProperty {
  return {
    name,
    component_type: componentType,
    attribute_id: `${name}-id`,
    attribute_name: name,
    element_type: elementType,
    nb_items: 1,
    components: componentIds.map((geode_id) => ({
      geode_id,
      min_values: [value],
      max_values: [value],
      no_data: false,
    })),
  };
}

const NODES = physicalPropertyNodes(
  [
    physicalProperty("porosity", "Block", "polyhedron", [BLOCK_ID], POROSITY),
    physicalProperty(
      "boundary_pressure",
      "Surface",
      "polygon",
      [SECOND_SURFACE_ID, SURFACE_ID],
      BOUNDARY_PRESSURE,
    ),
  ],
  [
    formattedComponent(BLOCK_ID, "h2_1", "Block"),
    formattedComponent(SECOND_SURFACE_ID, "boundary 10", "Surface"),
    formattedComponent(SURFACE_ID, "boundary 2", "Surface"),
  ],
);

// The titles of the rows a search shows, from the properties down to the components
function shownTitles(query: string): string[] {
  const titles: string[] = [];
  for (const node of searchPhysicalProperties(NODES, query)) {
    titles.push(node.title);
    for (const leaf of node.children) {
      titles.push(leaf.title);
    }
  }
  return titles;
}

describe("physical properties search and sort", () => {
  test("a property found by its name is kept whole, with its count", () => {
    expect(shownTitles("boundary p")).toStrictEqual([
      "Boundary pressure (2)",
      "boundary 2",
      "boundary 10",
    ]);
    expect(shownTitles("poro")).toStrictEqual(["Porosity (1)", "h2_1"]);
  });

  test("a component found by its name or id shows the properties it carries", () => {
    expect(shownTitles("boundary 10")).toStrictEqual(["Boundary pressure (1)", "boundary 10"]);
    expect(shownTitles(BLOCK_ID)).toStrictEqual(["Porosity (1)", "h2_1"]);
  });

  test("no row when nothing matches", () => {
    expect(searchPhysicalProperties(NODES, "permeability")).toStrictEqual([]);
  });

  test("the components of a property are sorted by name or by id", () => {
    const leaves = [
      { ...formattedComponent("surface-b", "boundary 2", "Surface"), physical_value: "1" },
      { ...formattedComponent("surface-a", "boundary 10", "Surface"), physical_value: "1" },
    ];
    expect(sortPhysicalPropertyLeaves(leaves, "name").map((leaf) => leaf.title)).toStrictEqual([
      "boundary 2",
      "boundary 10",
    ]);
    expect(sortPhysicalPropertyLeaves(leaves, "id").map((leaf) => leaf.title)).toStrictEqual([
      "boundary 10",
      "boundary 2",
    ]);
  });
});
