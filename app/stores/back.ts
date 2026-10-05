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

export const useBackStore = defineStore("back", {
  state: () => ({
    default_local_port: "5000",
    request_counter: 0,
    status: Status.NOT_CONNECTED,
    version: "0.0.0",
  }),
  getters: {
    protocol(): string {
      return getRestApiProtocol();
    },
    port(): string {
      return getRestApiPort(this.default_local_port);
    },
    base_url(): string {
      return this.base_url_for(useInfraStore().domain_name);
    },
    base_url_for(): (domain_name: string) => string {
      return (domain_name: string) => {
        let back_url = `${this.protocol}://${domain_name}:${this.port}`;
        if (isCloudMode()) {
          back_url += `/geode`;
        }
        return back_url;
      };
    },
    is_busy(): boolean {
      return this.request_counter > 0;
    },
  },
  actions: {
    set_ping() {
      // oxlint-disable-next-line typescript/no-floating-promises
      this.ping();
      setInterval(() => {
        // oxlint-disable-next-line typescript/no-floating-promises
        this.ping();
      }, DEFAULT_PING_INTERVAL_SECONDS * MILLISECONDS_IN_SECOND);
    },
    async ping() {
      const feedbackStore = useFeedbackStore();
      const schema = back_schemas.opengeodeweb_back.ping;
      const result = await this.request(
        { schema },
        {
          request_error_function: () => {
            feedbackStore.$patch({ server_error: true });
            this.status = Status.NOT_CONNECTED;
          },
          response_function: () => {
            feedbackStore.$patch({ server_error: false });
            this.status = Status.CONNECTED;
          },
          response_error_function: () => {
            feedbackStore.$patch({ server_error: true });
            this.status = Status.NOT_CONNECTED;
          },
        },
      );
      return result;
    },
    start_request() {
      this.request_counter += 1;
    },
    stop_request() {
      this.request_counter -= 1;
    },
    async launch(args: { projectFolderPath: string }) {
      const appStore = useAppStore();
      const { COMMAND_BACK, NUXT_ROOT_PATH } = useRuntimeConfig().public;
      const schema = opengeodeweb_front_schemas.api.local.app.run_back;
      const params = { COMMAND_BACK, NUXT_ROOT_PATH, args };

      const result = await appStore.request(
        { schema, params },
        {
          response_function: (response) => {
            this.default_local_port = String(response.port);
          },
        },
      );
      return result;
    },
    async connect(): Promise<void> {
      this.set_ping();
      await Promise.resolve();
    },
    async request<Schema extends JsonRpcSchema>(
      { schema, params }: { schema: Schema; params?: ParamsOf<Schema> },
      callbacks: RequestHandlers<ResponseOf<Schema>> = {},
    ): Promise<ResponseOf<Schema>> {
      const rpc_schema: JsonRpcSchema = schema;
      const result = await api_fetch(
        this,
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
    },
    async upload(file: File, callbacks: RequestHandlers = {}) {
      const schema = back_schemas.opengeodeweb_back.upload_file;
      const result = await upload_file(
        this,
        {
          schema,
          file,
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
    },
    async get_version(schema: MicroserviceVersionSchema | undefined) {
      if (!schema) {
        return undefined;
      }
      const result = await this.request(
        { schema },
        {
          response_function: ({ microservice_version }) => {
            this.version = microservice_version;
          },
        },
      );
      return result;
    },
  },
  share: {
    omit: ["status"],
  },
});
