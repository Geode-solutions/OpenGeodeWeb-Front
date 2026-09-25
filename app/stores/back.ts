import { getRestApiPort, getRestApiProtocol, isCloudMode } from "@ogw_front/utils/stores";
import { Status } from "@ogw_front/utils/status";
import { api_fetch } from "@ogw_internal/utils/api_fetch";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { upload_file } from "@ogw_internal/utils/upload_file.js";
import { useAppStore } from "@ogw_front/stores/app";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useInfraStore } from "@ogw_front/stores/infra";

import type { JsonRpcSchema, RequestHandlers } from "@ogw_shared/utils/types.js";

import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_schemas.json" with { type: "json" };

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
      const infraStore = useInfraStore();
      let back_url = `${this.protocol}://${infraStore.domain_name}:${this.port}`;
      if (isCloudMode()) {
        back_url += `/geode`;
      }
      return back_url;
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
    async launch(args: Record<string, unknown>) {
      const appStore = useAppStore();
      const { COMMAND_BACK, NUXT_ROOT_PATH } = useRuntimeConfig().public;
      const schema = opengeodeweb_front_schemas.api.local.app.run_back;
      const params = { COMMAND_BACK, NUXT_ROOT_PATH, args };

      const result = await appStore.request(
        { schema, params },
        {
          response_function: (response: unknown) => {
            if (
              typeof response === "object" &&
              response !== null &&
              "port" in response &&
              (typeof response.port === "string" || typeof response.port === "number")
            ) {
              this.default_local_port = String(response.port);
            }
          },
        },
      );
      return result;
    },
    async connect(): Promise<void> {
      this.set_ping();
      await Promise.resolve();
    },
    async request(
      { schema, params = {} }: { schema: JsonRpcSchema; params?: Record<string, unknown> },
      callbacks: RequestHandlers = {},
    ) {
      const result = await api_fetch(
        this,
        // The back store is only ever used with HTTP ("front"/"back") schemas,
        // Which always carry `methods`; the wider JsonRpcSchema param above is
        // Kept as-is to match this action's public signature.
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        { schema: schema as JsonRpcSchema & { methods: string[] }, params, headers: {} },
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
    async get_version(schema: JsonRpcSchema | undefined) {
      if (!schema) {
        return undefined;
      }
      const result = await this.request(
        { schema },
        {
          response_function: (response: unknown) => {
            if (
              typeof response === "object" &&
              response !== null &&
              "microservice_version" in response &&
              typeof response.microservice_version === "string"
            ) {
              this.version = response.microservice_version;
            }
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
