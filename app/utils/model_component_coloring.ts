import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";

const backSchemas = back_schemas.opengeodeweb_back;

const VERTEX_ATTRIBUTE_SCHEMAS = {
  names: backSchemas.model_component_vertex_attribute_names,
  range: backSchemas.model_component_vertex_attribute_range,
};

// Coloring options of the model components carrying only vertex attributes: the corners and the points
const MODEL_VERTEX_COLORING = {
  capabilities: {
    color: { available: true },
    textures: { available: false },
    vertex: { available: true },
    edge: { available: false },
    cell: { available: false },
    polygon: { available: false },
    polyhedron: { available: false },
  },
  schemas: {
    vertex: VERTEX_ATTRIBUTE_SCHEMAS,
  },
};

// Coloring options of the model lines: vertex and edge attributes
const MODEL_LINE_COLORING = {
  capabilities: {
    color: { available: true },
    textures: { available: false },
    vertex: { available: true },
    edge: { available: true },
    cell: { available: false },
    polygon: { available: false },
    polyhedron: { available: false },
  },
  schemas: {
    vertex: VERTEX_ATTRIBUTE_SCHEMAS,
    edge: {
      names: backSchemas.model_component_edge_attribute_names,
      range: backSchemas.model_component_edge_attribute_range,
    },
  },
};

export { MODEL_VERTEX_COLORING, MODEL_LINE_COLORING };
