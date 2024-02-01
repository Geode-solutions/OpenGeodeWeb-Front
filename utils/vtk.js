/* eslint-disable arrow-body-style */
function createMethods(session) {
  const functions_array = [
    "apply_textures",
    "create_object_pipeline",
    "create_visualization",
    "get_point_position",
    "point_size",
    "reset",
    "reset_camera",
    "set_color",
    "set_vertex_attribute",
    "toggle_edge_visibility",
    "toggle_object_visibility",
    "toggle_point_visibility",
    "update_data",
  ]
  var functions_object = {}
  for (const function_name of functions_array) {
    functions_object[function_name] = (params) =>
      session.call(function_name, [params])
  }
  return functions_object
}

export default createMethods
