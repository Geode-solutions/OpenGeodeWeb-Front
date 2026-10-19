import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

interface AttributeRangeSource {
  min_values?: readonly number[];
  max_values?: readonly number[];
  min_value?: number;
  max_value?: number;
}

interface AttributeRange {
  min: number;
  max: number;
}

function getAttributeRange(
  currentAttribute: AttributeRangeSource | undefined | null,
  compIndex = 0,
): AttributeRange {
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

const MESH_ELEMENT_KINDS: Record<string, string> = {
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

const MODEL_COMPONENT_ATTRIBUTE_SCHEMAS: Record<string, Record<string, { $id: string }>> = {
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

const MODEL_COMPONENT_KINDS: Record<string, string[]> = Object.fromEntries(
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

interface NamedAttribute {
  attribute_name: string;
  nb_items: number;
  time_steps?: readonly number[];
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
function attributeArrayName(name: string, timeStep: number | undefined): string {
  return timeStep === undefined ? name : `${name}@${timeStep}`;
}

export {
  MESH_ELEMENT_KINDS,
  MODEL_COMPONENT_ATTRIBUTE_SCHEMAS,
  MODEL_COMPONENT_KINDS,
  attributeArrayName,
  getAttributeRange,
  intersectAttributes,
  intersectBy,
};
