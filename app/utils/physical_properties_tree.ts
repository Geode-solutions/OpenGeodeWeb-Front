import type {
  ComponentType,
  ElementType,
  PhysicalProperty,
  PhysicalPropertyComponent,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { FormattedComponent } from "@ogw_internal/stores/data/model/mesh_components";

interface PhysicalPropertyLeaf extends FormattedComponent {
  // Value of the property on the component, already formatted for the tree
  readonly physical_value: string;
}

// What the model is colored with: an attribute item and its range on every component carrying it
interface PhysicalPropertyColoring {
  readonly item: number;
  readonly minimum: number;
  readonly maximum: number;
}

interface PhysicalPropertyNode {
  readonly id: string;
  readonly title: string;
  readonly physical_property: string;
  readonly attribute_name: string;
  readonly element_type: ElementType;
  readonly component_type: ComponentType;
  // Undefined when no component has a value
  readonly coloring: PhysicalPropertyColoring | undefined;
  // Of all the components carrying the property, for the hover and the focus of its row
  readonly viewer_ids: number[];
  readonly children: PhysicalPropertyLeaf[];
}

// The row ids of the properties, never taken for component ids
const PHYSICAL_PROPERTY_ID_PREFIX = "physical_properties:";
const SIGNIFICANT_DIGITS = 4;
const SMALL_VALUE = 1e-3;
const LARGE_VALUE = 1e4;
// An item without value, e.g. a free axis of a boundary displacement
const NO_VALUE = "–";

function physicalPropertyId(name: string): string {
  return `${PHYSICAL_PROPERTY_ID_PREFIX}${name}`;
}

// "boundary_pressure" -> "Boundary pressure"
function physicalPropertyTitle(name: string): string {
  const words = name.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Values come from float attributes (0.05000000074505806): a few significant digits, and an
// Exponent for the very small or large ones (permeabilities, moduli, pressures)
function formatNumber(value: number): string {
  const magnitude = Math.abs(value);
  if (magnitude !== 0 && (magnitude < SMALL_VALUE || magnitude >= LARGE_VALUE)) {
    const [mantissa = "", exponent = ""] = value.toExponential(SIGNIFICANT_DIGITS - 1).split("e");
    return `${Number(mantissa)}e${Number(exponent)}`;
  }
  return String(Number(value.toPrecision(SIGNIFICANT_DIGITS)));
}

function formatItem(
  minimum: number | null | undefined,
  maximum: number | null | undefined,
): string {
  if (minimum === null || minimum === undefined || maximum === null || maximum === undefined) {
    return NO_VALUE;
  }
  if (minimum === maximum) {
    return formatNumber(minimum);
  }
  return `${formatNumber(minimum)} – ${formatNumber(maximum)}`;
}

// The value of a uniform property, its range otherwise; vectors are written (x, y, z)
function formatPhysicalPropertyValue(component: PhysicalPropertyComponent): string {
  const items = component.min_values.map((minimum, index) =>
    formatItem(minimum, component.max_values[index]),
  );
  if (items.length === 1) {
    return items[0] ?? NO_VALUE;
  }
  return `(${items.join(", ")})`;
}

function itemRange(
  components: readonly PhysicalPropertyComponent[],
  item: number,
): [number, number] | undefined {
  const minima = components.flatMap((component) => component.min_values[item] ?? []);
  const maxima = components.flatMap((component) => component.max_values[item] ?? []);
  if (minima.length === 0 || maxima.length === 0) {
    return undefined;
  }
  return [Math.min(...minima), Math.max(...maxima)];
}

// The first item with a value is colored, e.g. the x axis of a permeability or the fixed axis of
// A boundary displacement
function physicalPropertyColoring(
  physicalProperty: PhysicalProperty,
): PhysicalPropertyColoring | undefined {
  for (let item = 0; item < physicalProperty.nb_items; item += 1) {
    const range = itemRange(physicalProperty.components, item);
    if (range !== undefined) {
      return { item, minimum: range[0], maximum: range[1] };
    }
  }
  return undefined;
}

function physicalPropertyNodeTitle(name: string, nbComponents: number): string {
  return `${physicalPropertyTitle(name)} (${nbComponents})`;
}

function physicalPropertyNode(
  physicalProperty: PhysicalProperty,
  componentsById: ReadonlyMap<string, FormattedComponent>,
): PhysicalPropertyNode {
  // A component unknown to the tree (not imported as a mesh component) cannot be shown
  const children = physicalProperty.components.flatMap((component) => {
    const formatted = componentsById.get(component.geode_id);
    if (formatted === undefined) {
      return [];
    }
    return [{ ...formatted, physical_value: formatPhysicalPropertyValue(component) }];
  });
  children.sort((childA, childB) =>
    childA.title.localeCompare(childB.title, undefined, { numeric: true, sensitivity: "base" }),
  );
  return {
    id: physicalPropertyId(physicalProperty.name),
    title: physicalPropertyNodeTitle(physicalProperty.name, children.length),
    physical_property: physicalProperty.name,
    attribute_name: physicalProperty.attribute_name,
    element_type: physicalProperty.element_type,
    component_type: physicalProperty.component_type,
    coloring: physicalPropertyColoring(physicalProperty),
    viewer_ids: children.map((child) => child.viewer_id),
    children,
  };
}

// The components of a property by name, or by id as the other trees sort them
function sortPhysicalPropertyLeaves(
  leaves: readonly PhysicalPropertyLeaf[],
  sortType: string,
): PhysicalPropertyLeaf[] {
  function key(leaf: PhysicalPropertyLeaf): string {
    return sortType === "id" ? leaf.geode_id : leaf.title;
  }
  return leaves.toSorted((leafA, leafB) =>
    key(leafA).localeCompare(key(leafB), undefined, { numeric: true, sensitivity: "base" }),
  );
}

// The physical properties shown in their tree, by name, each listing the components carrying it
// With their value. A property on no component known to the tree is left out
function physicalPropertyNodes(
  physicalProperties: readonly PhysicalProperty[],
  components: readonly FormattedComponent[],
): PhysicalPropertyNode[] {
  const componentsById = new Map(components.map((component) => [component.id, component]));
  return physicalProperties
    .map((physicalProperty) => physicalPropertyNode(physicalProperty, componentsById))
    .filter((node) => node.children.length > 0)
    .toSorted((nodeA, nodeB) => nodeA.title.localeCompare(nodeB.title));
}

function matchesPhysicalProperty(node: PhysicalPropertyNode, query: string): boolean {
  return (
    node.physical_property.toLowerCase().includes(query) ||
    physicalPropertyTitle(node.physical_property).toLowerCase().includes(query)
  );
}

function matchesComponent(component: PhysicalPropertyLeaf, query: string): boolean {
  return (
    component.title.toLowerCase().includes(query) || component.id.toLowerCase().includes(query)
  );
}

// What a search keeps of the physical properties: a property matching by its name ("poro",
// "boundary p") whole, otherwise the components matching by their title or id, counted in the
// Property title. The tree then shows the matching rows only. The query is lower case
function searchPhysicalProperties(
  nodes: readonly PhysicalPropertyNode[],
  query: string,
): PhysicalPropertyNode[] {
  return nodes.flatMap((node) => {
    if (matchesPhysicalProperty(node, query)) {
      return [node];
    }
    const components = node.children.filter((component) => matchesComponent(component, query));
    if (components.length === 0) {
      return [];
    }
    return [
      {
        ...node,
        title: physicalPropertyNodeTitle(node.physical_property, components.length),
        children: components,
      },
    ];
  });
}

export {
  formatNumber,
  formatPhysicalPropertyValue,
  physicalPropertyColoring,
  physicalPropertyId,
  physicalPropertyNodes,
  physicalPropertyTitle,
  searchPhysicalProperties,
  sortPhysicalPropertyLeaves,
};
export type { PhysicalPropertyColoring, PhysicalPropertyLeaf, PhysicalPropertyNode };
