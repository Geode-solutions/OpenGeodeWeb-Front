import type {
  AttributeLocation,
  AttributeTimeStep,
  AttributeTimeValue,
} from "@ogw_front/types/attribute";
import type {
  AttributeName,
  AttributeRangeMaximum,
  AttributeRangeMinimum,
} from "@geode/opengeodeweb-viewer/schema_types";
import type { Count } from "@ogw_front/types/ui";
import type { GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";
import type { ModelComponentType } from "@ogw_front/types/model";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

interface AttributeRangeSource {
  min_values?: readonly AttributeRangeMinimum[];
  max_values?: readonly AttributeRangeMaximum[];
  min_value?: AttributeRangeMinimum;
  max_value?: AttributeRangeMaximum;
}

interface AttributeMinMax {
  min: AttributeRangeMinimum;
  max: AttributeRangeMaximum;
}

function getAttributeRange(
  currentAttribute: AttributeRangeSource | undefined | null,
  compIndex = 0,
): AttributeMinMax {
  if (!currentAttribute) {
    return { min: 0, max: 1 };
  }

  const { min_values, max_values, min_value, max_value } = currentAttribute;
  let min = 0;
  let max = 1;

  const min_at_index = min_values?.[compIndex];
  if (min_at_index !== undefined) {
    min = min_at_index;
  } else if (compIndex === 0 && min_value !== undefined) {
    min = min_value;
  }

  const max_at_index = max_values?.[compIndex];
  if (max_at_index !== undefined) {
    max = max_at_index;
  } else if (compIndex === 0 && max_value !== undefined) {
    max = max_value;
  }

  return { min, max };
}

const MESH_ELEMENT_KINDS: Partial<Record<GeodeObjectType, AttributeLocation>> = {
  EdgedCurve2D: "edge",
  EdgedCurve3D: "edge",
  LightRegularGrid2D: "cell",
  LightRegularGrid3D: "cell",
  RegularGrid2D: "cell",
  RegularGrid3D: "cell",
  PolygonalSurface2D: "polygon",
  PolygonalSurface3D: "polygon",
  TriangulatedSurface2D: "polygon",
  TriangulatedSurface3D: "polygon",
  HybridSolid3D: "polyhedron",
  PolyhedralSolid3D: "polyhedron",
  TetrahedralSolid3D: "polyhedron",
};

const MODEL_COMPONENT_ATTRIBUTE_SCHEMAS: Record<
  ModelComponentType,
  Record<AttributeLocation, { $id: string }>
> = {
  Corner: { vertex: viewer_schemas.opengeodeweb_viewer.model.corners.attribute.vertex.attribute },
  Line: {
    vertex: viewer_schemas.opengeodeweb_viewer.model.lines.attribute.vertex.attribute,
    edge: viewer_schemas.opengeodeweb_viewer.model.lines.attribute.edge.attribute,
  },
  Surface: {
    vertex: viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.vertex.attribute,
    polygon: viewer_schemas.opengeodeweb_viewer.model.surfaces.attribute.polygon.attribute,
  },
  Block: {
    vertex: viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.vertex.attribute,
    polyhedron: viewer_schemas.opengeodeweb_viewer.model.blocks.attribute.polyhedron.attribute,
  },
};

const MODEL_COMPONENT_KINDS: Record<ModelComponentType, AttributeLocation[]> = Object.fromEntries(
  Object.entries(MODEL_COMPONENT_ATTRIBUTE_SCHEMAS).map(([type, schemas]) => [
    type,
    Object.keys(schemas),
  ]),
);

function intersectBy<TItem>(
  lists: readonly (readonly TItem[])[],
  key: (item: TItem) => string,
): TItem[] {
  const [first = [], ...others] = lists;
  return first.filter((item) =>
    others.every((list) => list.some((other) => key(other) === key(item))),
  );
}

// An attribute of a data: its name, its number of items and the time steps it is defined at
interface NamedAttribute {
  attribute_name: AttributeName;
  nb_items: Count;
  time_steps?: readonly AttributeTimeValue[];
}

// What the back-end answers for an attribute, which may carry more fields than these
interface AttributeInfo extends NamedAttribute {
  time_steps?: AttributeTimeValue[];
  [key: string]: unknown;
}

function sameTimeSteps(left: NamedAttribute, right: NamedAttribute): boolean {
  const leftSteps = left.time_steps ?? [];
  const rightSteps = right.time_steps ?? [];
  return (
    leftSteps.length === rightSteps.length &&
    leftSteps.every((time, index) => time === rightSteps[index])
  );
}

function intersectAttributes<TAttribute extends NamedAttribute>(
  attributesPerData: readonly (readonly TAttribute[])[],
): TAttribute[] {
  const allAttributes = attributesPerData.flat();
  const common: TAttribute[] = [];
  for (const attribute of intersectBy(attributesPerData, (item) => item.attribute_name)) {
    const sameName = allAttributes.filter(
      (other) => other.attribute_name === attribute.attribute_name,
    );
    if (!sameName.every((other) => sameTimeSteps(other, attribute))) {
      continue;
    }
    const nb_items = Math.min(...sameName.map((other) => other.nb_items));
    common.push({ ...attribute, nb_items });
  }
  return common;
}

// OpenGeode-IO writes each step of a time series as the "<name>@<step>" VTK array
function attributeArrayName(name: AttributeName, timeStep: AttributeTimeStep | undefined): string {
  return timeStep === undefined ? name : `${name}@${timeStep}`;
}

export type { AttributeInfo, NamedAttribute };
export {
  MESH_ELEMENT_KINDS,
  MODEL_COMPONENT_ATTRIBUTE_SCHEMAS,
  MODEL_COMPONENT_KINDS,
  attributeArrayName,
  getAttributeRange,
  intersectAttributes,
  intersectBy,
};
