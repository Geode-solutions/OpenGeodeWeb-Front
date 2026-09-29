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

const MODEL_COMPONENT_KINDS: Record<string, string[]> = {
  Corner: ["vertex"],
  Line: ["vertex", "edge"],
  Surface: ["vertex", "polygon"],
  Block: ["vertex", "polyhedron"],
};

interface NamedAttribute {
  attribute_name: string;
  nb_items: number;
}

function intersectAttributes<TAttribute extends NamedAttribute>(
  attributesPerData: readonly (readonly TAttribute[])[],
): TAttribute[] {
  const [first, ...others] = attributesPerData;
  if (!first) {
    return [];
  }
  const common: TAttribute[] = [];
  for (const attribute of first) {
    const matches = others.map((attributes) =>
      attributes.find((other) => other.attribute_name === attribute.attribute_name),
    );
    if (matches.every((match) => match !== undefined)) {
      const nb_items = Math.min(attribute.nb_items, ...matches.map((match) => match.nb_items));
      common.push({ ...attribute, nb_items });
    }
  }
  return common;
}

export { MESH_ELEMENT_KINDS, MODEL_COMPONENT_KINDS, getAttributeRange, intersectAttributes };
