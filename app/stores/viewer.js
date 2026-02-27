// Third party imports
import vtkWSLinkClient, {
  newInstance,
} from "@kitware/vtk.js/IO/Core/WSLinkClient"
// oxlint-disable-next-line id-length
import _ from "lodash"
// oxlint-disable-next-line no-unassigned-import
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry"
import schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import { useRuntimeConfig } from "nuxt/app"

// Local imports
import Status from "@ogw_front/utils/status"
import { appMode } from "@ogw_front/utils/app_mode"
import { useAppStore } from "@ogw_front/stores/app"
import { useInfraStore } from "@ogw_front/stores/infra"
import { viewer_call } from "../../internal/utils/viewer_call"

const MS_PER_SECOND = 1000
const SECONDS_PER_REQUEST = 10
const request_timeout = MS_PER_SECOND * SECONDS_PER_REQUEST

export const useViewerStore = defineStore(
  "viewer",
  () => {
    const infraStore = useInfraStore()

    const default_local_port = ref("1234")
    const client = ref({})
    const config = ref(undefined)
    const picking_mode = ref(false)
    const picked_point = ref({ x: undefined, y: undefined })
    const request_counter = ref(0)
    const status = ref(Status.NOT_CONNECTED)
    const buzy = ref(0)

    const protocol = computed(() => {
      if (infraStore.app_mode === appMode.CLOUD) {
        return "wss"
      }
      return "ws"
    })

    const port = computed(() => {
      if (infraStore.app_mode === appMode.CLOUD) {
        return "443"
      }
      return default_local_port.value
    })

    const base_url = computed(() => {
      let viewer_url = `${protocol.value}://${infraStore.domain_name}:${port.value}`
      if (infraStore.app_mode === appMode.CLOUD) {
        if (infraStore.ID === "") {
          throw new Error("ID must not be empty in cloud mode")
        }
        viewer_url += `/${infraStore.ID}/viewer`
      }
      viewer_url += "/ws"
      return viewer_url
    })

    const is_busy = computed(() => request_counter.value > 0)

    function toggle_picking_mode(value) {
      picking_mode.value = value
    }

    async function set_picked_point(x, y) {
      const response = await request(
        schemas.opengeodeweb_viewer.generic.get_point_position,
        { x, y },
      )
      const { x: world_x, y: world_y } = response
      picked_point.value.x = world_x
      picked_point.value.y = world_y
      picking_mode.value = false
    }

    async function ws_connect() {
      if (status.value === Status.CONNECTED) {
        return
      }
      return navigator.locks.request("viewer.ws_connect", async (lock) => {
        if (status.value === Status.CONNECTED) {
          return
        }
        try {
          console.log("VIEWER LOCK GRANTED !", lock)
          status.value = Status.CONNECTING
          const { default: SmartConnect } = await import(
            "wslink/src/SmartConnect"
          )
          vtkWSLinkClient.setSmartConnectClass(SmartConnect)

          const config_obj = { application: "Viewer" }
          config_obj.sessionURL = base_url.value

          if (status.value === Status.CONNECTED && client.value.isConnected()) {
            client.value.disconnect(-1)
            status.value = Status.NOT_CONNECTED
          }
          let clientToConnect = client.value
          if (_.isEmpty(clientToConnect)) {
            clientToConnect = newInstance()
          }

          // Connect to busy store
          clientToConnect.onBusyChange((count) => {
            buzy.value = count
          })
          clientToConnect.beginBusy()

          // Error
          clientToConnect.onConnectionError((httpReq) => {
            const message = httpReq?.response?.error || `Connection error`
            console.error(message)
          })

          // Close
          clientToConnect.onConnectionClose((httpReq) => {
            const message = httpReq?.response?.error || `Connection close`
            console.error(message)
          })

          // Connect
          const { connectImageStream } = await import(
            "@kitware/vtk.js/Rendering/Misc/RemoteView"
          )
          client.value = await clientToConnect.connect(config_obj)
          connectImageStream(client.value.getConnection().getSession())
          clientToConnect.endBusy()
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
      request_counter.value += 1
    }

    function stop_request() {
      request_counter.value -= 1
    }

    function launch(args = { projectFolderPath }) {
      console.log("[VIEWER] Launching viewer microservice...", { args })
      const appStore = useAppStore()

      const { VIEWER_PATH, VIEWER_COMMAND } = useRuntimeConfig().public

      console.log("[VIEWER] VIEWER_PATH", VIEWER_PATH)
      console.log("[VIEWER] VIEWER_COMMAND", VIEWER_COMMAND)
      const schema = {
        $id: "/api/app/run_viewer",
        methods: ["POST"],
        type: "object",
        properties: {
          VIEWER_PATH: { type: "string" },
          VIEWER_COMMAND: { type: "string" },
        },
        required: ["VIEWER_PATH", "VIEWER_COMMAND"],
        additionalProperties: true,
      }

      const params = {
        VIEWER_PATH,
        VIEWER_COMMAND,
        args,
      }

      console.log("[VIEWER] params", params)

      return appStore.request(schema, params, {
        response_function: (response) => {
          this.default_local_port = response.port
          console.log("[VIEWER] Viewer launched")
        },
      })
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
