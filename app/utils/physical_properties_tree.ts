import type {
  PhysicalProperty,
  Component as PhysicalPropertyComponent,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { FormattedComponent } from "@ogw_front/stores/data_helpers/mesh";

interface PhysicalPropertyLeaf extends FormattedComponent {
  // Value of the property on the component, already formatted for the tree
  readonly physical_value: string;
}

interface PhysicalPropertyNode {
  readonly id: string;
  readonly title: string;
  readonly physical_property: string;
  readonly attribute_name: string;
  readonly element_type: string;
  readonly component_type: string;
  readonly children: PhysicalPropertyLeaf[];
}

interface PhysicalPropertiesGroup {
  readonly id: string;
  readonly title: string;
  readonly children: PhysicalPropertyNode[];
}

const PHYSICAL_PROPERTIES_GROUP_ID = "physical_properties";
const PHYSICAL_PROPERTY_ID_PREFIX = `${PHYSICAL_PROPERTIES_GROUP_ID}:`;
const SIGNIFICANT_DIGITS = 4;
const SMALL_VALUE = 1e-3;
const LARGE_VALUE = 1e4;
// An item without value, e.g. a free axis of a boundary displacement
const NO_VALUE = "–";

function physicalPropertyId(name: string): string {
  return `${PHYSICAL_PROPERTY_ID_PREFIX}${name}`;
}

// Tree ids of the physical properties: never model components
function isPhysicalPropertyId(id: string): boolean {
  return id === PHYSICAL_PROPERTIES_GROUP_ID || id.startsWith(PHYSICAL_PROPERTY_ID_PREFIX);
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
    title: `${physicalPropertyTitle(physicalProperty.name)} (${children.length})`,
    physical_property: physicalProperty.name,
    attribute_name: physicalProperty.attribute_name,
    element_type: physicalProperty.element_type,
    component_type: physicalProperty.component_type,
    children,
  };
}

// One child per physical property, listing the components carrying it with their value.
// Undefined without any physical property: the model tree then shows no group
function physicalPropertiesGroup(
  physicalProperties: readonly PhysicalProperty[],
  components: readonly FormattedComponent[],
): PhysicalPropertiesGroup | undefined {
  const componentsById = new Map(components.map((component) => [component.id, component]));
  const children = physicalProperties
    .map((physicalProperty) => physicalPropertyNode(physicalProperty, componentsById))
    .filter((node) => node.children.length > 0);
  if (children.length === 0) {
    return undefined;
  }
  return {
    id: PHYSICAL_PROPERTIES_GROUP_ID,
    title: `Physical properties (${children.length})`,
    children,
  };
}

export {
  PHYSICAL_PROPERTIES_GROUP_ID,
  formatNumber,
  formatPhysicalPropertyValue,
  isPhysicalPropertyId,
  physicalPropertiesGroup,
  physicalPropertyId,
  physicalPropertyTitle,
};
export type { PhysicalPropertiesGroup, PhysicalPropertyLeaf, PhysicalPropertyNode };
