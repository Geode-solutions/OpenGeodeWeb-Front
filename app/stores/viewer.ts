// Third party imports
// oxlint-disable-next-line no-unassigned-import
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Geometry";
import { connectImageStream } from "@kitware/vtk.js/Rendering/Misc/RemoteView";
import { initWebSocketClient } from "@ogw_internal/utils/ws_client";
import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_schemas.json" with { type: "json" };
import opengeodeweb_viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" };

// Local imports
import {
  getWebsocketApiPort,
  getWebsocketApiProtocol,
  isCloudMode,
} from "@ogw_front/utils/stores.js";
import { Status } from "@ogw_front/utils/status";
import { useAppStore } from "@ogw_front/stores/app";
import { useInfraStore } from "@ogw_front/stores/infra";
import { viewer_call } from "@ogw_internal/utils/viewer_call";

import type { JsonRpcSchema, RequestHandlers } from "@ogw_shared/utils/types.js";
// oxlint-disable-next-line import/max-dependencies -- all imports above are required by this store.
import type { RpcClient } from "@ogw_shared/utils/call_raw.js";

interface PickedPoint {
  x: number | undefined;
  y: number | undefined;
  z: number | undefined;
}

const MS_PER_SECOND = 1000;
const SECONDS_PER_REQUEST = 10;
const request_timeout = MS_PER_SECOND * SECONDS_PER_REQUEST;
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
    async function request(
      {
        schema,
        params = {},
        timeout = request_timeout,
      }: Readonly<{
        schema: JsonRpcSchema;
        params?: Readonly<Record<string, unknown>>;
        timeout?: number;
      }>,
      callbacks: RequestHandlers = {},
    ): Promise<unknown> {
      const microservice = { $id: "viewer", base_url: base_url.value, start_request, stop_request };
      const result = await viewer_call(
        microservice,
        {
          schema,
          params,
          timeout,
        },
        {
          ...callbacks,
          response_function: async (response: unknown) => {
            if (callbacks.response_function) {
              await callbacks.response_function(response);
            }
          },
        },
      );
      return result;
    }
    async function set_picked_point(x: number, y: number): Promise<void> {
      const schema = opengeodeweb_viewer_schemas.opengeodeweb_viewer.viewer.get_point_position;
      const params = {
        x: Math.round(x),
        y: Math.round(y),
      };
      const response = await request({
        schema,
        params,
      });
      const {
        x: world_x,
        y: world_y,
        z: world_z,
        // oxlint-disable-next-line no-unsafe-type-assertion -- response shape is defined by the get_point_position schema.
      } = response as { x: number; y: number; z: number };
      picked_point.value = {
        x: world_x,
        y: world_y,
        z: world_z,
      };
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
          client.value = (await initWebSocketClient(base_url.value, client.value, {
            onConnectionClose: () => {
              status.value = Status.NOT_CONNECTED;
            },
            // oxlint-disable-next-line no-unsafe-type-assertion -- initWebSocketClient's return is not typed as RpcClient.
          })) as unknown as RpcClient;
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
    async function launch(args: Readonly<{ projectFolderPath?: string }> = {}): Promise<unknown> {
      const appStore = useAppStore();
      const { COMMAND_VIEWER, NUXT_ROOT_PATH } = useRuntimeConfig().public;
      const schema = opengeodeweb_front_schemas.api.local.app.run_viewer;
      const params = {
        COMMAND_VIEWER,
        NUXT_ROOT_PATH,
        args,
      };
      const result = await appStore.request(
        {
          schema,
          params,
        },
        {
          response_function: (response: unknown) => {
            // oxlint-disable-next-line no-unsafe-type-assertion -- response shape is defined by the run_viewer schema.
            const { port: viewerPort } = response as { port: string };
            default_local_port.value = viewerPort;
          },
        },
      );
      return result;
    }
    async function connect(): Promise<void> {
      await ws_connect();
    }
    async function get_version(schema: JsonRpcSchema | undefined): Promise<unknown> {
      if (!schema) {
        return undefined;
      }
      const result = await request(
        {
          schema,
        },
        {
          response_function: (response: unknown) => {
            // oxlint-disable-next-line no-unsafe-type-assertion -- response shape is defined by the version schema.
            const { microservice_version } = response as { microservice_version: string };
            version.value = microservice_version;
          },
        },
      );
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
