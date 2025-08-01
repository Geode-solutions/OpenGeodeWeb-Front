import _ from "lodash"
import vtkWSLinkClient from "@kitware/vtk.js/IO/Core/WSLinkClient"
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry"
import schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import Status from "@ogw_f/utils/status.js"

export const use_viewer_store = defineStore("viewer", {
  state: () => ({
    default_local_port: "1234",
    client: {},
    config: null,
    picking_mode: false,
    picked_point: { x: null, y: null },
    request_counter: 0,
    status: Status.NOT_CONNECTED,
  }),
  getters: {
    protocol() {
      if (use_infra_store().app_mode == appMode.appMode.CLOUD) {
        return "wss"
      } else {
        return "ws"
      }
    },
    port() {
      if (use_infra_store().app_mode == appMode.appMode.CLOUD) {
        return "443"
      }
      const VIEWER_PORT = useRuntimeConfig().public.VIEWER_PORT
      if (VIEWER_PORT != null && VIEWER_PORT !== "") {
        return VIEWER_PORT
      }
      return this.default_local_port
    },
    base_url() {
      const infra_store = use_infra_store()
      let viewer_url = `${this.protocol}://${infra_store.domain_name}:${this.port}`
      if (infra_store.app_mode == appMode.appMode.CLOUD) {
        if (infra_store.ID == "") {
          throw new Error("ID must not be empty in cloud mode")
        }
        viewer_url += `/${infra_store.ID}/viewer`
      }
      viewer_url += "/ws"
      return viewer_url
    },
    is_busy() {
      return this.request_counter > 0
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
      if (process.env.NODE_ENV == "test") return
      if (this.status === Status.CONNECTED) return
      return navigator.locks.request("viewer.ws_connect", async (lock) => {
        if (this.status === Status.CONNECTED) return
        console.log("VIEWER LOCK GRANTED !", lock)
        this.status = Status.CONNECTING
        const SmartConnect = await import("wslink/src/SmartConnect")
        vtkWSLinkClient.setSmartConnectClass(SmartConnect)

        const config = { application: "Viewer" }
        config.sessionURL = this.base_url

        const { client } = this
        if (this.status === Status.CONNECTED && client.isConnected()) {
          client.disconnect(-1)
          this.status = Status.NOT_CONNECTED
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
        const viewer_store = this
        return new Promise((resolve, reject) => {
          clientToConnect
            .connect(config)
            .then((validClient) => {
              connectImageStream(validClient.getConnection().getSession())
              viewer_store.client = validClient
              clientToConnect.endBusy()

              // Now that the client is ready let's setup the server for us
              viewer_call({
                schema: schemas.opengeodeweb_viewer.viewer.reset_visualization,
              })
              viewer_store.status = Status.CONNECTED
              resolve()
            })
            .catch((error) => {
              console.error(error)
              viewer_store.status = Status.NOT_CONNECTED
              reject(error)
            })
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
  share: {
    omit: ["status", "client"],
  },
})
