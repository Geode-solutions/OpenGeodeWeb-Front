// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local constants
const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges;
const file_name = "test.og_edc3d";
const geode_object = "EdgedCurve3D";
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;
const range: [number, number] = [MINIMUM_RANGE, MAXIMUM_RANGE];
const default_vertex_attribute = { name: "vertex_attribute", item: 0, range };
const default_edge_attribute = { name: "edge_attribute", item: 0, range };

export {
  default_edge_attribute,
  default_vertex_attribute,
  file_name,
  geode_object,
  mesh_edges_schemas,
  range,
};
