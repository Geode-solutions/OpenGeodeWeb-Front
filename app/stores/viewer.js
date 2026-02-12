import { defineStore } from "pinia"
import _ from "lodash"
import vtkWSLinkClient from "@kitware/vtk.js/IO/Core/WSLinkClient"
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry"
import schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import Status from "@ogw_front/utils/status"
import { appMode } from "@ogw_front/utils/app_mode"
import { viewer_call } from "../../internal/utils/viewer_call"
import { useInfraStore } from "@ogw_front/stores/infra"

const request_timeout = 10 * 1000

export const useViewerStore = defineStore(
  "viewer",
  () => {
    const infraStore = useInfraStore()

    const default_local_port = ref("1234")
    const client = ref({})
    const config = ref(null)
    const picking_mode = ref(false)
    const picked_point = ref({ x: null, y: null })
    const request_counter = ref(0)
    const status = ref(Status.NOT_CONNECTED)
    const buzy = ref(0)

    const protocol = computed(() => {
      if (useInfraStore().app_mode == appMode.CLOUD) {
        return "wss"
      } else {
        return "ws"
      }
    })

    const port = computed(() => {
      if (useInfraStore().app_mode == appMode.CLOUD) {
        return "443"
      }
      const VIEWER_PORT = useRuntimeConfig().public.VIEWER_PORT
      if (VIEWER_PORT != null && VIEWER_PORT !== "") {
        return VIEWER_PORT
      }
      return default_local_port.value
    })

    const base_url = computed(() => {
      let viewer_url = `${protocol.value}://${infraStore.domain_name}:${port.value}`
      if (infraStore.app_mode == appMode.CLOUD) {
        if (infraStore.ID == "") {
          throw new Error("ID must not be empty in cloud mode")
        }
        viewer_url += `/${infraStore.ID}/viewer`
      }
      viewer_url += "/ws"
      return viewer_url
    })

    const is_busy = computed(() => {
      return request_counter.value > 0
    })

    function toggle_picking_mode(value) {
      picking_mode.value = value
    }

    async function set_picked_point(x, y) {
      const response = await get_point_position({ x, y })
      const { x: world_x, y: world_y } = response
      picked_point.value.x = world_x
      picked_point.value.y = world_y
      picking_mode.value = false
    }

    async function ws_connect() {
      if (status.value === Status.CONNECTED) return

      return navigator.locks.request("viewer.ws_connect", async (lock) => {
        if (status.value === Status.CONNECTED) return
        try {
          console.log("VIEWER LOCK GRANTED !", lock)
          status.value = Status.CONNECTING
          const SmartConnect = await import("wslink/src/SmartConnect")
          vtkWSLinkClient.setSmartConnectClass(SmartConnect)

          const config_obj = { application: "Viewer" }
          config_obj.sessionURL = base_url.value

          if (status.value === Status.CONNECTED && client.value.isConnected()) {
            client.value.disconnect(-1)
            status.value = Status.NOT_CONNECTED
          }
          let clientToConnect = client.value
          if (_.isEmpty(clientToConnect)) {
            clientToConnect = vtkWSLinkClient.newInstance()
          }

          // Connect to busy store
          clientToConnect.onBusyChange((count) => {
            buzy.value = count
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
          const { connectImageStream } =
            await import("@kitware/vtk.js/Rendering/Misc/RemoteView")
          client.value = await clientToConnect.connect(config_obj)
          connectImageStream(client.value.getConnection().getSession())
          client.value.endBusy()
          await request(
            schemas.opengeodeweb_viewer.viewer.reset_visualization,
            {},
            {},
            undefined,
          )
          status.value = Status.CONNECTED
        } catch (error) {
          console.error("error", error)
          status.value = Status.NOT_CONNECTED
          throw error
        }
      })
    }

    function start_request() {
      request_counter.value++
    }

    function stop_request() {
      request_counter.value--
    }

    async function launch() {
      console.log("[VIEWER] Launching viewer microservice...")
      const port = await window.electronAPI.run_viewer()
      console.log("[VIEWER] Viewer launched on port:", port)
      return port
    }

    async function connect() {
      console.log("[VIEWER] Connecting to viewer microservice...")
      await ws_connect()
      console.log("[VIEWER] Viewer connected successfully")
    }

    function request(
      schema,
      params = {},
      callbacks = {},
      timeout = request_timeout,
    ) {
      console.log("[VIEWER] Request:", schema.$id)

      // Get current store instance to pass to viewer_call
      const store = useViewerStore()

      return viewer_call(
        store,
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
    }

    return {
      default_local_port,
      client,
      config,
      picking_mode,
      picked_point,
      request_counter,
      status,
      protocol,
      port,
      base_url,
      is_busy,
      toggle_picking_mode,
      set_picked_point,
      ws_connect,
      start_request,
      stop_request,
      launch,
      connect,
      request,
    }
  },
  {
    share: {
      omit: ["status", "client"],
    },
  },
)
