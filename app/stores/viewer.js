// oxlint-disable-next-line id-length
import _ from "lodash"
// oxlint-disable-next-line no-unassigned-import
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry"
import Status from "@ogw_front/utils/status"
import { appMode } from "@ogw_front/utils/app_mode"
import schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import { useInfraStore } from "@ogw_front/stores/infra"
import { viewer_call } from "../../internal/utils/viewer_call"
import vtkWSLinkClient from "@kitware/vtk.js/IO/Core/WSLinkClient"

const MS_IN_SECOND = 1000
const REQUEST_TIMEOUT_IN_SECONDS = 10
const REQUEST_TIMEOUT = REQUEST_TIMEOUT_IN_SECONDS * MS_IN_SECOND

export const useViewerStore = defineStore("viewer", {
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
      if (useInfraStore().app_mode === appMode.CLOUD) {
        return "wss"
      } else {
        return "ws"
      }
    },
    port() {
      if (useInfraStore().app_mode === appMode.CLOUD) {
        return "443"
      }
      const { VIEWER_PORT } = useRuntimeConfig().public
      if (VIEWER_PORT !== null && VIEWER_PORT !== "") {
        return VIEWER_PORT
      }
      return this.default_local_port
    },
    base_url() {
      const infraStore = useInfraStore()
      let viewer_url = `${this.protocol}://${infraStore.domain_name}:${this.port}`
      if (infraStore.app_mode === appMode.CLOUD) {
        if (infraStore.ID === "") {
          throw new Error("ID must not be empty in cloud mode")
        }
        viewer_url += `/${infraStore.ID}/viewer`
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
          // oxlint-disable-next-line import/no-named-as-default-member
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
        try {
          const validClient = await clientToConnect.connect(config)
          connectImageStream(validClient.getConnection().getSession())
          this.client = validClient
          clientToConnect.endBusy()
          await viewer_call(
            this,
            {
              schema: schemas.opengeodeweb_viewer.viewer.reset_visualization,
            },
            { timeout: undefined },
          )
          this.status = Status.CONNECTED
        } catch (error) {
          console.error("error", error)
          this.status = Status.NOT_CONNECTED
          throw error
        }
      })
    },
    start_request() {
      this.request_counter += 1
    },
    stop_request() {
      this.request_counter -= 1
    },
    async launch() {
      console.log("[VIEWER] Launching viewer microservice...")
      const port = await window.electronAPI.run_viewer()
      console.log("[VIEWER] Viewer launched on port:", port)
      return port
    },
    async connect() {
      console.log("[VIEWER] Connecting to viewer microservice...")
      await this.ws_connect()
      console.log("[VIEWER] Viewer connected successfully")
    },
    request(schema, params = {}, callbacks = {}, timeout = REQUEST_TIMEOUT) {
      console.log("[VIEWER] Request:", schema.$id)

      return viewer_call(
        this,
        { schema, params },
        {
          ...callbacks,
          response_function: async (response) => {
            console.log("[VIEWER] Request completed:", schema.$id)
            if (callbacks.response_function) {
              await callbacks.response_function(response)
            }
          },
        },
        timeout,
      )
    },
  },
  share: {
    omit: ["status", "client"],
  },
})
