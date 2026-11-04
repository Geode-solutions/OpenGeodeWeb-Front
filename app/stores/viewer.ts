// Third party imports
// oxlint-disable-next-line no-unassigned-import
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry";
import type { Vector3 } from "@kitware/vtk.js/types";
import { connectImageStream } from "@kitware/vtk.js/Rendering/Misc/RemoteView";
import { initWebSocketClient } from "@ogw_internal/utils/ws_client";
import opengeodeweb_viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { type ViewerRequestArgs, callViewer } from "./viewer_helpers/request.js";
import {
  fetchViewerVersion,
  launchViewerMicroservice,
  pickWorldPosition,
} from "./viewer_helpers/actions.js";
import {
  getWebsocketApiPort,
  getWebsocketApiProtocol,
  isCloudMode,
} from "@ogw_front/utils/stores.js";
import { Status } from "@ogw_front/utils/status";
import { useInfraStore } from "@ogw_front/stores/infra";

import type {
  JsonRpcSchema,
  MicroserviceVersionSchema,
  RequestHandlers,
  ResponseOf,
} from "@ogw_shared/utils/types.js";
// oxlint-disable-next-line import/max-dependencies -- all imports above are required by this store.
import type { RpcClient } from "@ogw_shared/utils/call_raw.js";

interface PickedPoint {
  x: number | undefined;
  y: number | undefined;
  z: number | undefined;
}

export const useViewerStore = defineStore(
  "viewer",
  // oxlint-disable-next-line max-lines-per-function, max-statements
  () => {
    const infraStore = useInfraStore();
    const default_local_port = ref("1234");
    // oxlint-disable-next-line no-unsafe-type-assertion -- placeholder before the real client is set by ws_connect.
    const client = ref<RpcClient>({} as RpcClient);
    const config = ref<unknown>(undefined);
    const picking_mode = ref(false);
    const picked_point = ref<PickedPoint>({
      x: undefined,
      y: undefined,
      z: undefined,
    });
    const request_counter = ref(0);
    const status = ref(Status.NOT_CONNECTED);
    const version = ref("0.0.0");
    const protocol = computed(() => getWebsocketApiProtocol());
    const port = computed(() => getWebsocketApiPort(default_local_port.value));
    const base_url = computed(() => {
      let viewer_url = `${protocol.value}://${infraStore.domain_name}:${port.value}`;
      if (isCloudMode()) {
        viewer_url += `/viewer`;
      }
      viewer_url += "/ws";
      return viewer_url;
    });
    function start_request(): void {
      request_counter.value += 1;
    }
    function stop_request(): void {
      request_counter.value -= 1;
    }
    const is_busy = computed(() => request_counter.value > 0);
    function toggle_picking_mode(value: boolean): void {
      picking_mode.value = value;
    }
    // oxlint-disable-next-line unicorn/consistent-function-scoping
    async function request<Schema extends JsonRpcSchema>(
      args: ViewerRequestArgs<Schema>,
      callbacks: RequestHandlers<ResponseOf<Schema>> = {},
    ): Promise<ResponseOf<Schema>> {
      const microservice = {
        $id: "viewer",
        client: client.value,
        base_url: base_url.value,
        start_request,
        stop_request,
      };
      const result = await callViewer(microservice, args, callbacks);
      return result;
    }
    async function pick_world_position(x: number, y: number): Promise<Vector3> {
      const position = await pickWorldPosition(request, x, y);
      return position;
    }
    async function set_picked_point(x: number, y: number): Promise<void> {
      const [world_x, world_y, world_z] = await pick_world_position(x, y);
      picked_point.value = { x: world_x, y: world_y, z: world_z };
    }
    async function ws_connect(): Promise<void> {
      if (status.value === Status.CONNECTED) {
        return;
      }
      await navigator.locks.request("viewer.ws_connect", async () => {
        if (status.value === Status.CONNECTED) {
          return;
        }
        try {
          status.value = Status.CONNECTING;
          const wsClient = await initWebSocketClient(base_url.value, client.value, {
            onConnectionClose: () => {
              status.value = Status.NOT_CONNECTED;
            },
          });
          // oxlint-disable-next-line no-unsafe-type-assertion -- initWebSocketClient's return is not typed as RpcClient.
          client.value = wsClient as unknown as RpcClient;
          connectImageStream(client.value.getConnection().getSession());
          // oxlint-disable-next-line no-unsafe-type-assertion -- endBusy is not part of the RpcClient type.
          (client.value as unknown as { endBusy: () => void }).endBusy();
          const schema = opengeodeweb_viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization;
          const timeout = undefined;
          await request({
            schema,
            timeout,
          });
          status.value = Status.CONNECTED;
        } catch (error) {
          status.value = Status.NOT_CONNECTED;
          throw error;
        }
      });
    }
    async function launch(args: Readonly<{ projectFolderPath: string }>): Promise<unknown> {
      const result = await launchViewerMicroservice(args, (new_port) => {
        default_local_port.value = new_port;
      });
      return result;
    }
    async function connect(): Promise<void> {
      await ws_connect();
    }
    async function get_version(
      schema: MicroserviceVersionSchema | undefined,
    ): Promise<{ microservice_version: string } | undefined> {
      const result = await fetchViewerVersion(request, schema, (microservice_version) => {
        version.value = microservice_version;
      });
      return result;
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
      pick_world_position,
      ws_connect,
      start_request,
      stop_request,
      launch,
      connect,
      request,
      version,
      get_version,
    };
  },
  {
    share: {
      omit: ["status", "client"],
    },
  },
);
