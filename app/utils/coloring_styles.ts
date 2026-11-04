import type { AttributeSchemas } from "@ogw_front/utils/attribute_range";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";

interface Schemas {
  vertex?: AttributeSchemas;
  edge?: AttributeSchemas;
  cell?: AttributeSchemas;
  polygon?: AttributeSchemas;
  polyhedron?: AttributeSchemas;
}

interface ColoringStyle {
  name: string;
  value: string;
}

interface ColoringAvailability {
  color: boolean;
  textures: boolean;
  vertex: boolean;
  edge: boolean;
  cell: boolean;
  polygon: boolean;
  polyhedron: boolean;
}

const COLORING_STYLES = {
  color: { name: "Constant", value: "constant" },
  random: { name: "Random", value: "random" },
  textures: { name: "Textures", value: "textures" },
  vertex: { name: "Vertex attribute", value: "vertex" },
  edge: { name: "Edge attribute", value: "edge" },
  cell: { name: "Cell attribute", value: "cell" },
  polygon: { name: "Polygon attribute", value: "polygon" },
  polyhedron: {
    name: "Polyhedron attribute",
    value: "polyhedron",
  },
};

const ATTRIBUTE_STYLE_KEYS = [
  "textures",
  "vertex",
  "edge",
  "cell",
  "polygon",
  "polyhedron",
] as const;

function buildColoringStyles(
  available: ColoringAvailability,
  allowRandom: boolean,
): { labels: string[]; values: string[] } {
  const array: ColoringStyle[] = [];
  if (available.color) {
    array.push(COLORING_STYLES.color);
    if (allowRandom) {
      array.push(COLORING_STYLES.random);
    }
  }
  for (const key of ATTRIBUTE_STYLE_KEYS) {
    if (available[key]) {
      array.push(COLORING_STYLES[key]);
    }
  }

  const labels = array.map((coloring) => coloring.name);
  const values = array.map((coloring) => coloring.value);

  return { labels, values };
}

// The attribute schemas of the props, each defaulting to the ones of the mesh elements
function resolveAttributeSchemas(schemas: Schemas): Required<Schemas> {
  const backSchemas = back_schemas.opengeodeweb_back;
  return {
    vertex: schemas.vertex ?? {
      names: backSchemas.vertex_attribute_names,
      range: backSchemas.vertex_attribute_range,
    },
    edge: schemas.edge ?? {
      names: backSchemas.edge_attribute_names,
      range: backSchemas.edge_attribute_range,
    },
    cell: schemas.cell ?? {
      names: backSchemas.cell_attribute_names,
      range: backSchemas.cell_attribute_range,
    },
    polygon: schemas.polygon ?? {
      names: backSchemas.polygon_attribute_names,
      range: backSchemas.polygon_attribute_range,
    },
    polyhedron: schemas.polyhedron ?? {
      names: backSchemas.polyhedron_attribute_names,
      range: backSchemas.polyhedron_attribute_range,
    },
  };
}

export { COLORING_STYLES, buildColoringStyles, resolveAttributeSchemas };
export type { Schemas };
