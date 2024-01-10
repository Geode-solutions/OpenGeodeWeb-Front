/* eslint-disable arrow-body-style */

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

function createMethods(session) {
  var object = {}
  for (const function_name in functions_array) {
    object[function_] = (params) => {
      session.call(function_name, [params])
    }
  }

  return object
  //   return {
  //     create_object_pipeline: (params) =>
  //       session.call("create_object_pipeline", [params]),
  //     create_visualization: () => session.call("create_visualization", []),
  //     reset: () => session.call("reset"),
  //     reset_camera: () => session.call("reset_camera", []),
  //     toggle_object_visibility: (params) =>
  //       session.call("toggle_object_visibility", [params]),
  //     toggle_edge_visibility: (params) =>
  //       session.call("toggle_edge_visibility", [params]),
  //     toggle_point_visibility: (params) =>
  //       session.call("toggle_point_visibility", [params]),
  //     set_color: (params) => session.call("set_color", [params]),
  //     set_vertex_attribute: (params) =>
  //       session.call("set_vertex_attribute", [params]),
  //     point_size: (params) => session.call("point_size", [params]),
  //     apply_textures: (params) => session.call("apply_textures", [params]),
  //     get_point_position: (params) =>
  //       session.call("get_point_position", [params]),
  //     update_data: (params) => session.call("update_data", [params]),
  //   }
}

export default createMethods
