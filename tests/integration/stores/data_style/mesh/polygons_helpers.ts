// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local constants
const mesh_polygons_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polygons;
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points;
const file_name = "test.og_psf3d";
const geode_object = "PolygonalSurface3D";
const MINIMUM_RANGE = 10;
const MAXIMUM_RANGE = 20;
const range: [number, number] = [MINIMUM_RANGE, MAXIMUM_RANGE];
const default_vertex_attribute = { name: "points", item: 0, range };
const default_polygon_attribute = { name: "test_attribute", item: 0, range };

export {
  default_polygon_attribute,
  default_vertex_attribute,
  file_name,
  geode_object,
  mesh_points_schemas,
  mesh_polygons_schemas,
  range,
};
