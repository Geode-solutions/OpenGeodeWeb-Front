// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local constants
const mesh_polyhedra_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra;
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points;
const file_name = "test.vtu";
const geode_object = "HybridSolid3D";
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;
const range: [number, number] = [MINIMUM_RANGE, MAXIMUM_RANGE];
const default_vertex_attribute = { name: "toto_on_vertices", item: 0, range };
const default_polyhedron_attribute = { name: "toto_on_polyhedra", item: 0, range };

export {
  default_polyhedron_attribute,
  default_vertex_attribute,
  file_name,
  geode_object,
  mesh_points_schemas,
  mesh_polyhedra_schemas,
  range,
};
