export const use_viewer_store = defineStore('viewer', {
  state: () => ({
    picking_mode: false,
    picked_point: { x: null, y: null }
  }),
  actions: {
    toggle_picking_mode (value) {
      this.picking_mode = value
    },
    async set_picked_point (x, y) {
      const response = await this.get_point_position({ x, y })
      const { x: world_x, y: world_y } = response
      this.picked_point.x = world_x
      this.picked_point.y = world_y
      this.picking_mode = false
    },
    async create_object_pipeline (params) {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        websocket_store.client
          .getRemote()
          .vtk.create_object_pipeline(params)
          .catch(console.error);
        websocket_store.stop_request()
      }
    },
    async delete_object_pipeline (params) {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        websocket_store.client
          .getRemote()
          .vtk.delete_object_pipeline(params)
          .catch(console.error);
        websocket_store.stop_request()
      }
    },
    async reset_camera () {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        websocket_store.client
          .getRemote()
          .vtk.reset_camera()
          .catch(console.error);
        websocket_store.stop_request()
      }
    },
    async toggle_object_visibility (params) {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        websocket_store.client
          .getRemote()
          .vtk.toggle_object_visibility(params)
          .catch(console.error);
        websocket_store.stop_request()
      }
    },
    async toggle_edge_visibility (params) {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        websocket_store.client
          .getRemote()
          .vtk.toggle_edge_visibility(params)
          .catch(console.error);
        websocket_store.stop_request()
      }
    },
    async toggle_point_visibility (params) {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        websocket_store.client
          .getRemote()
          .vtk.toggle_point_visibility(params)
          .catch(console.error);
        websocket_store.stop_request()
      }
    },
    async point_size (params) {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        websocket_store.client
          .getRemote()
          .vtk.point_size(params)
          .catch(console.error);
        websocket_store.stop_request()
      }
    },
    async set_color (params) {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        websocket_store.client
          .getRemote()
          .vtk.set_color(params)
          .catch(console.error);
        websocket_store.stop_request()
      }
    },
    async set_vertex_attribute (params) {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        websocket_store.client
          .getRemote()
          .vtk.set_vertex_attribute(params)
          .catch(console.error);
        websocket_store.stop_request()
      }
    },
    async apply_textures (params) {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        websocket_store.client
          .getRemote()
          .vtk.apply_textures(params)
          .catch(console.error);
        websocket_store.stop_request()
      }
    },
    async get_point_position (params) {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        const response = await websocket_store.client
          .getRemote()
          .vtk.get_point_position(params)
          .catch(console.error);
        websocket_store.stop_request()
        return response
      }
    },
    async update_data (params) {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        const response = await websocket_store.client
          .getRemote()
          .vtk.update_data(params)
          .catch(console.error);
        websocket_store.stop_request()
        return response
      }
    },
    async reset () {
      const websocket_store = use_websocket_store()
      if (websocket_store.client) {
        websocket_store.start_request()
        const response = await websocket_store.client
          .getRemote()
          .vtk.reset()
          .catch(console.error);
        websocket_store.stop_request()
        return response
      }
    }
  }
})