import { getRestApiPort, getRestApiProtocol, isCloudMode } from "@ogw_front/utils/stores";
import { Status } from "@ogw_front/utils/status";
import { api_fetch } from "@ogw_internal/utils/api_fetch";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { upload_file } from "@ogw_internal/utils/upload_file.js";
import { useAppStore } from "@ogw_front/stores/app";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useInfraStore } from "@ogw_front/stores/infra";

import type {
  JsonRpcSchema,
  MicroserviceVersionSchema,
  ParamsOf,
  RequestHandlers,
  ResponseOf,
} from "@ogw_shared/utils/types.js";

import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

const MILLISECONDS_IN_SECOND = 1000;
const DEFAULT_PING_INTERVAL_SECONDS = 10;

export const useBackStore = defineStore(
  "back",
  // oxlint-disable-next-line max-lines-per-function, max-statements
  () => {
    const default_local_port = ref("5000");
    const request_counter = ref(0);
    const status = ref(Status.NOT_CONNECTED);
    const version = ref("0.0.0");

    const protocol = computed(() => getRestApiProtocol());
    const port = computed(() => getRestApiPort(default_local_port.value));

    function base_url_for(domain_name: string): string {
      let back_url = `${protocol.value}://${domain_name}:${port.value}`;
      if (isCloudMode()) {
        back_url += `/geode`;
      }
      return back_url;
    }

    // The infra store is read lazily: this store can be created before the Nuxt app context
    const base_url = computed(() => base_url_for(useInfraStore().microservice_domain_name));
    const is_busy = computed(() => request_counter.value > 0);

    function start_request(): void {
      request_counter.value += 1;
    }

    function stop_request(): void {
      request_counter.value -= 1;
    }

    function microservice(): {
      $id: string;
      base_url: string;
      start_request: () => void;
      stop_request: () => void;
    } {
      return { $id: "back", base_url: base_url.value, start_request, stop_request };
    }

    async function request<Schema extends JsonRpcSchema>(
      { schema, params }: { schema: Schema; params?: ParamsOf<Schema> },
      callbacks: RequestHandlers<ResponseOf<Schema>> = {},
    ): Promise<ResponseOf<Schema>> {
      const rpc_schema: JsonRpcSchema = schema;
      const result = await api_fetch(
        microservice(),
        // The back store is only ever used with HTTP ("front"/"back") schemas,
        // Which always carry `methods`; the wider JsonRpcSchema param above is
        // Kept as-is to match this action's public signature.
        {
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion
          schema: rpc_schema as JsonRpcSchema & { methods: string[] },
          params: params ?? {},
          headers: {},
        },
        {
          ...callbacks,
          response_function: async (response: unknown) => {
            if (callbacks.response_function) {
              // The back validates its responses against the schema `response` it was generated from.
              // oxlint-disable-next-line typescript/no-unsafe-type-assertion
              await callbacks.response_function(response as ResponseOf<Schema>);
            }
          },
        },
      );
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      return result as ResponseOf<Schema>;
    }

    async function ping(): Promise<unknown> {
      const feedbackStore = useFeedbackStore();
      const schema = back_schemas.opengeodeweb_back.ping;
      function onError(): void {
        feedbackStore.$patch({ server_error: true });
        status.value = Status.NOT_CONNECTED;
      }
      const result = await request(
        { schema },
        {
          request_error_function: onError,
          response_function: () => {
            feedbackStore.$patch({ server_error: false });
            status.value = Status.CONNECTED;
          },
          response_error_function: onError,
        },
      );
      return result;
    }

    function set_ping(): void {
      void ping();
      setInterval(() => {
        void ping();
      }, DEFAULT_PING_INTERVAL_SECONDS * MILLISECONDS_IN_SECOND);
    }

    async function launch(args: { projectFolderPath: string }): Promise<unknown> {
      const appStore = useAppStore();
      const { COMMAND_BACK, NUXT_ROOT_PATH } = useRuntimeConfig().public;
      const schema = opengeodeweb_front_schemas.api.local.app.run_back;
      const params = { COMMAND_BACK, NUXT_ROOT_PATH, args };

      const result = await appStore.request(
        { schema, params },
        {
          response_function: (response) => {
            default_local_port.value = String(response.port);
          },
        },
      );
      return result;
    }

    async function connect(): Promise<void> {
      set_ping();
      await Promise.resolve();
    }

    async function upload(file: File, callbacks: RequestHandlers = {}): Promise<unknown> {
      const schema = back_schemas.opengeodeweb_back.upload_file;
      const result = await upload_file(microservice(), { schema, file }, callbacks);
      return result;
    }

    async function get_version(
      schema: MicroserviceVersionSchema | undefined,
    ): Promise<{ microservice_version: string } | undefined> {
      if (!schema) {
        return undefined;
      }
      const result = await request(
        { schema },
        {
          response_function: ({ microservice_version }) => {
            version.value = microservice_version;
          },
        },
      );
      return result;
    }

    return {
      default_local_port,
      request_counter,
      status,
      version,
      protocol,
      port,
      base_url,
      base_url_for,
      is_busy,
      set_ping,
      ping,
      start_request,
      stop_request,
      launch,
      connect,
      request,
      upload,
      get_version,
    };
  },
  {
    share: {
      omit: ["status"],
    },
  },
);
