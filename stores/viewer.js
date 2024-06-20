import _ from "lodash"
import vtkWSLinkClient from "@kitware/vtk.js/IO/Core/WSLinkClient"
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry"
import { connectImageStream } from "@kitware/vtk.js/Rendering/Misc/RemoteView"
import schemas from "@geode/opengeodeweb-viewer/schemas.json"

export const use_viewer_store = defineStore("viewer", {
  state: () => ({
    client: {},
    config: null,
    is_running: false,
    picking_mode: false,
    picked_point: { x: null, y: null },
    request_counter: 0,
  }),
  getters: {
    base_url: () => {
      const cloud_store = use_cloud_store()
      const public_runtime_config = useRuntimeConfig().public
      var viewer_url = `${public_runtime_config.VIEWER_PROTOCOL}://${public_runtime_config.API_URL}:${public_runtime_config.VIEWER_PORT}`
      if (process.env.NODE_ENV == "production") {
        viewer_url += `/${cloud_store.ID}/viewer`
      }
      viewer_url += "/ws"
      return viewer_url
    },
    is_busy: (state) => {
      return state.request_counter > 0
    },
  },
  actions: {
    toggle_picking_mode(value) {
      this.picking_mode = value
    },
    async set_picked_point(x, y) {
      const response = await this.get_point_position({ x, y })
      const { x: world_x, y: world_y } = response
      this.picked_point.x = world_x
      this.picked_point.y = world_y
      this.picking_mode = false
    },
    async ws_connect() {
      if (process.env.NODE_ENV == "test") {
        return
      }
      const SmartConnect = await import("wslink/src/SmartConnect")
      vtkWSLinkClient.setSmartConnectClass(SmartConnect)

      const config = { application: "Viewer" }
      config.sessionURL = this.base_url

      const { client } = this
      if (this.is_running && client.isConnected()) {
        client.disconnect(-1)
        this.is_running = false
      }
      let clientToConnect = client
      if (_.isEmpty(clientToConnect)) {
        clientToConnect = vtkWSLinkClient.newInstance()
      }

      // Connect to busy store
      clientToConnect.onBusyChange((count) => {
        this.buzy = count
      })
      clientToConnect.beginBusy()

      // Error
      clientToConnect.onConnectionError((httpReq) => {
        const message =
          (httpReq && httpReq.response && httpReq.response.error) ||
          `Connection error`
        console.error(message)
      })

      // Close
      clientToConnect.onConnectionClose((httpReq) => {
        const message =
          (httpReq && httpReq.response && httpReq.response.error) ||
          `Connection close`
        console.error(message)
      })

      // Connect
      const { connectImageStream } = await import(
        "@kitware/vtk.js/Rendering/Misc/RemoteView"
      )
      return new Promise((resolve, reject) => {
        clientToConnect
          .connect(config)
          .then((validClient) => {
            connectImageStream(validClient.getConnection().getSession())
            this.client = validClient
            clientToConnect.endBusy()

            // Now that the client is ready let's setup the server for us
            viewer_call({
              schema: schemas.opengeodeweb_viewer.create_visualization,
            })
            viewer_call({
              schema: schemas.opengeodeweb_viewer.reset,
            })
            this.is_running = true
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    start_request() {
      this.request_counter++
    },
    stop_request() {
      this.request_counter--
    },
  },
})
