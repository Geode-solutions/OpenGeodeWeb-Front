/* eslint-disable arrow-body-style */
export default function createMethods (session) {
  return {
    create_object_pipeline: (params) => session.call('create_object_pipeline', [params]),
    create_visualization: () => session.call('create_visualization', []),
    reset: () => session.call('reset'),
    reset_camera: () => session.call('reset_camera', []),
    toggle_object_visibility: (params) => session.call('toggle_object_visibility', [params]),
    apply_textures: (params) => session.call('apply_textures', [params]),
    get_point_position: (params) => session.call('get_point_position', [params]),
    update_data: (params) => session.call('update_data', [params])
  };
}
