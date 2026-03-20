// Third party imports
import vtkWSLinkClient, { newInstance } from "@kitware/vtk.js/IO/Core/WSLinkClient";
import _ from "lodash";
// oxlint-disable-next-line no-unassigned-import
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry";
import SmartConnect from "wslink/src/SmartConnect";
import { connectImageStream } from "@kitware/vtk.js/Rendering/Misc/RemoteView";
import schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_front/utils/local/app_mode";
import { useAppStore } from "@ogw_front/stores/app";
import { useInfraStore } from "@ogw_front/stores/infra";
import { viewer_call } from "@ogw_internal/utils/viewer_call";

const MS_PER_SECOND = 1000;
const SECONDS_PER_REQUEST = 10;
const request_timeout = MS_PER_SECOND * SECONDS_PER_REQUEST;

export const useViewerStore = defineStore(
  "viewer",
  // oxlint-disable-next-line max-lines-per-function max-statements
  () => {
    const infraStore = useInfraStore();
    const default_local_port = ref("1234");
    const client = ref({});
    const config = ref(undefined);
    const picking_mode = ref(false);
    const picked_point = ref({ x: undefined, y: undefined });
    const request_counter = ref(0);
    const status = ref(Status.NOT_CONNECTED);
    const buzy = ref(0);

    const protocol = computed(() => {
      if (infraStore.app_mode === appMode.CLOUD) {
        return "wss";
      }
      return "ws";
    });

    const port = computed(() => {
      if (infraStore.app_mode === appMode.CLOUD) {
        return "443";
      }
      return default_local_port.value;
    });

    const base_url = computed(() => {
      let viewer_url = `${protocol.value}://${infraStore.domain_name}:${port.value}`;
      if (infraStore.app_mode === appMode.CLOUD) {
        if (infraStore.ID === "") {
          throw new Error("ID must not be empty in cloud mode");
        }
        viewer_url += `/${infraStore.ID}/viewer`;
      }
      viewer_url += "/ws";
      return viewer_url;
    });

    const is_busy = computed(() => request_counter.value > 0);

    function toggle_picking_mode(value) {
      picking_mode.value = value;
    }

    async function set_picked_point(x, y) {
      const response = await request(schemas.opengeodeweb_viewer.generic.get_point_position, {
        x,
        y,
      });
      const { x: world_x, y: world_y } = response;
      picked_point.value.x = world_x;
      picked_point.value.y = world_y;
      picking_mode.value = false;
    }

    function ws_connect() {
      if (status.value === Status.CONNECTED) {
        return;
      }
      return navigator.locks.request("viewer.ws_connect", async (lock) => {
        if (status.value === Status.CONNECTED) {
          return;
        }
        try {
          console.log("VIEWER LOCK GRANTED !", lock);
          status.value = Status.CONNECTING;
          vtkWSLinkClient.setSmartConnectClass(SmartConnect);

          if (_.isEmpty(client.value)) {
            client.value = newInstance();
          }

          client.value.onBusyChange((count) => {
            buzy.value = count;
          });
          client.value.onConnectionError((httpReq) => {
            const message = httpReq?.response?.error || `Connection error`;
            console.error(message);
          });
          client.value.onConnectionClose((httpReq) => {
            const message = httpReq?.response?.error || `Connection close`;
            console.error(message);
          });

          client.value.beginBusy();
          await client.value.connect({
            application: "Viewer",
            sessionURL: base_url.value,
          });
          connectImageStream(client.value.getConnection().getSession());
          client.value.endBusy();
          await request(schemas.opengeodeweb_viewer.viewer.reset_visualization, {}, {}, undefined);
          status.value = Status.CONNECTED;
        } catch (error) {
          console.error("ws_connect error", error);
          status.value = Status.NOT_CONNECTED;
          throw error;
        }
      });
    }

    function start_request() {
      request_counter.value += 1;
    }

    function stop_request() {
      request_counter.value -= 1;
    }

    function launch(args = { projectFolderPath }) {
      console.log("[VIEWER] Launching viewer microservice...", { args });
      const appStore = useAppStore();
      const schema = {
        $id: "/api/app/run_viewer",
        methods: ["POST"],
        type: "object",
        properties: {},
        required: [],
        additionalProperties: true,
      };

      const params = { args };
      console.log("[VIEWER] params", params);

      return appStore.request(schema, params, {
        response_function: (response) => {
          console.log(`[VIEWER] Viewer launched on port ${response.port}`);
          this.default_local_port = response.port;
        },
      });
    }

    async function connect() {
      console.log("[VIEWER] Connecting to viewer microservice...");
      await ws_connect();
      console.log("[VIEWER] Viewer connected successfully");
    }

    function request(schema, params = {}, callbacks = {}, timeout = request_timeout) {
      console.log("[VIEWER] Request:", schema.$id);
      const start = Date.now();

      // Get current store instance to pass to viewer_call
      const store = useViewerStore();

      return viewer_call(
        store,
        { schema, params },
        {
          ...callbacks,
          response_function: async (response) => {
            console.log(
              "[VIEWER] Request completed:",
              schema.$id,
              "in",
              (Date.now() - start) / MS_PER_SECOND,
              "s",
            );
            if (callbacks.response_function) {
              await callbacks.response_function(response);
            }
          },
        },
        timeout,
      );
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
    };
  },
  {
    share: {
      omit: ["status", "client"],
    },
  },
);
