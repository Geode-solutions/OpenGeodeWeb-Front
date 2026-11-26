import { describe, expect, test } from "vitest";
import {
  physicalPropertiesGroup,
  searchPhysicalProperties,
} from "@ogw_front/utils/physical_properties_tree";
import type { FormattedComponent } from "@ogw_front/stores/data_helpers/mesh";
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

const GROUP = physicalPropertiesGroup(
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

// The titles of the rows a search shows, from the group down to the components
function shownTitles(query: string): string[] {
  const titles: string[] = [];
  for (const found of searchPhysicalProperties(GROUP, query)) {
    titles.push(found.title);
    for (const node of found.children) {
      titles.push(node.title);
      for (const leaf of node.children) {
        titles.push(leaf.title);
      }
    }
  }
  return titles;
}

describe("physical properties search", () => {
  test("a property found by its name is kept whole, with its count", () => {
    expect(shownTitles("boundary p")).toStrictEqual([
      "Physical properties (1)",
      "Boundary pressure (2)",
      "boundary 2",
      "boundary 10",
    ]);
    expect(shownTitles("poro")).toStrictEqual(["Physical properties (1)", "Porosity (1)", "h2_1"]);
  });

  test("a component found by its name or id shows the properties it carries", () => {
    expect(shownTitles("boundary 10")).toStrictEqual([
      "Physical properties (1)",
      "Boundary pressure (1)",
      "boundary 10",
    ]);
    expect(shownTitles(BLOCK_ID)).toStrictEqual([
      "Physical properties (1)",
      "Porosity (1)",
      "h2_1",
    ]);
  });

  test("no row when nothing matches", () => {
    expect(searchPhysicalProperties(GROUP, "permeability")).toStrictEqual([]);
    expect(searchPhysicalProperties(undefined, "poro")).toStrictEqual([]);
  });
});
