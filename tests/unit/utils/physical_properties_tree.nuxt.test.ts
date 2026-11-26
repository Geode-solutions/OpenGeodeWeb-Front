// oxlint-disable no-magic-numbers
// oxlint-disable unicorn/no-null -- the back sends null for an item without value (NaN is not JSON)
import { describe, expect, test } from "vitest";
import {
  formatNumber,
  formatPhysicalPropertyValue,
  isPhysicalPropertyId,
  physicalPropertiesGroup,
  physicalPropertyId,
  physicalPropertyTitle,
} from "@ogw_front/utils/physical_properties_tree";
import type { FormattedComponent } from "@ogw_front/stores/data_helpers/mesh";
import type { PhysicalProperty } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";

const BLOCK_ID = "block-1";
const SURFACE_ID = "surface-1";
const SECOND_SURFACE_ID = "surface-2";
const UNKNOWN_ID = "unknown";
const POROSITY = 0.05;
const BOUNDARY_PRESSURE = 2e7;

function formattedComponent(id: string, title: string, category: string): FormattedComponent {
  return { id, geode_id: id, title, category, viewer_id: 0, is_active: true };
}

const BLOCK = formattedComponent(BLOCK_ID, "h2_1", "Block");
// Out of name order: the tree sorts them
const SECOND_SURFACE = formattedComponent(SECOND_SURFACE_ID, "boundary 10", "Surface");
const SURFACE = formattedComponent(SURFACE_ID, "boundary 2", "Surface");
const COMPONENTS = [BLOCK, SECOND_SURFACE, SURFACE];

function component(
  geode_id: string,
  min_values: (number | null)[],
  max_values: (number | null)[] = min_values,
): PhysicalProperty["components"][number] {
  return { geode_id, min_values, max_values, no_data: false };
}

function physicalProperty(
  name: string,
  attribute_name: string,
  components: PhysicalProperty["components"],
): PhysicalProperty {
  const onBlocks = name === "porosity";
  return {
    name,
    component_type: onBlocks ? "Block" : "Surface",
    attribute_id: `${name}-id`,
    attribute_name,
    element_type: onBlocks ? "polyhedron" : "polygon",
    nb_items: components[0]?.min_values.length ?? 1,
    components,
  };
}

describe("physical properties tree", () => {
  test("numbers keep a few significant digits", () => {
    // Float attribute values
    expect(formatNumber(0.050000000745)).toBe("0.05");
    expect(formatNumber(2650)).toBe("2650");
    expect(formatNumber(0)).toBe("0");
  });

  test("very small or large numbers get an exponent", () => {
    expect(formatNumber(1.000000004e-15)).toBe("1e-15");
    expect(formatNumber(13_333_332_992)).toBe("1.333e10");
    expect(formatNumber(-2e7)).toBe("-2e7");
  });

  test("a uniform value is shown alone, a varying one as its range", () => {
    expect(formatPhysicalPropertyValue(component(BLOCK_ID, [POROSITY]))).toBe("0.05");
    expect(formatPhysicalPropertyValue(component(BLOCK_ID, [0.1], [0.3]))).toBe("0.1 – 0.3");
  });

  test("vectors are written (x, y, z), an item without value as a dash", () => {
    expect(formatPhysicalPropertyValue(component(SURFACE_ID, [1e-13, 1e-13, 1e-14]))).toBe(
      "(1e-13, 1e-13, 1e-14)",
    );
    expect(formatPhysicalPropertyValue(component(SURFACE_ID, [null, 0, null]))).toBe("(–, 0, –)");
  });

  test("property names are titled", () => {
    expect(physicalPropertyTitle("boundary_pressure")).toBe("Boundary pressure");
    expect(physicalPropertyTitle("porosity")).toBe("Porosity");
  });

  test("property rows are never component rows", () => {
    expect(isPhysicalPropertyId("physical_properties")).toBe(true);
    expect(isPhysicalPropertyId(physicalPropertyId("porosity"))).toBe(true);
    expect(isPhysicalPropertyId(BLOCK_ID)).toBe(false);
  });

  test("one child per property, listing its components by name with their value", () => {
    const properties = [
      physicalProperty("porosity", "porosity", [component(BLOCK_ID, [POROSITY])]),
      // The attribute keeps its own name
      physicalProperty("boundary_pressure", "pressure", [
        component(SECOND_SURFACE_ID, [BOUNDARY_PRESSURE]),
        component(SURFACE_ID, [BOUNDARY_PRESSURE]),
        // Not a mesh component of the tree: skipped
        component(UNKNOWN_ID, [BOUNDARY_PRESSURE]),
      ]),
    ];
    expect(physicalPropertiesGroup(properties, COMPONENTS)).toStrictEqual({
      id: "physical_properties",
      title: "Physical properties (2)",
      children: [
        {
          id: "physical_properties:porosity",
          title: "Porosity (1)",
          physical_property: "porosity",
          attribute_name: "porosity",
          element_type: "polyhedron",
          component_type: "Block",
          children: [{ ...BLOCK, physical_value: "0.05" }],
        },
        {
          id: "physical_properties:boundary_pressure",
          title: "Boundary pressure (2)",
          physical_property: "boundary_pressure",
          attribute_name: "pressure",
          element_type: "polygon",
          component_type: "Surface",
          children: [
            { ...SURFACE, physical_value: "2e7" },
            { ...SECOND_SURFACE, physical_value: "2e7" },
          ],
        },
      ],
    });
  });

  test("no group without any shown property", () => {
    expect(physicalPropertiesGroup([], COMPONENTS)).toBeUndefined();
    const onUnknownComponent = physicalProperty("porosity", "porosity", [
      component(UNKNOWN_ID, [POROSITY]),
    ]);
    expect(physicalPropertiesGroup([onUnknownComponent], COMPONENTS)).toBeUndefined();
  });
});
