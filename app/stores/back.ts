import { getRestApiPort, getRestApiProtocol, isCloudMode } from "@ogw_front/utils/stores";
import { Status } from "@ogw_front/utils/status";
import { api_fetch } from "@ogw_internal/utils/api_fetch";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { upload_file } from "@ogw_internal/utils/upload_file.js";
import { useAppStore } from "@ogw_front/stores/app";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useInfraStore } from "@ogw_front/stores/infra";

import type { JsonRpcSchema, RequestHandlers } from "#shared/utils/types.js";

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
      this.ping();
      setInterval(() => {
        this.ping();
      }, DEFAULT_PING_INTERVAL_SECONDS * MILLISECONDS_IN_SECOND);
    },
    ping() {
      const feedbackStore = useFeedbackStore();
      const schema = back_schemas.opengeodeweb_back.ping;
      return this.request(
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
    },
    start_request() {
      this.request_counter += 1;
    },
    stop_request() {
      this.request_counter -= 1;
    },
    launch(args: Record<string, unknown>) {
      console.log("[GEODE] Launching back microservice...", { args });
      const appStore = useAppStore();
      const { COMMAND_BACK, NUXT_ROOT_PATH } = useRuntimeConfig().public;
      const schema = opengeodeweb_front_schemas.api.local.app.run_back;
      const params = { COMMAND_BACK, NUXT_ROOT_PATH, args };

      console.log("[GEODE] params", params);
      return appStore.request(
        { schema, params },
        {
          response_function: (response: unknown) => {
            const { port } = response as { port: string };
            console.log(`[GEODE] Back launched on port ${port}`);
            this.default_local_port = port;
          },
        },
      );
    },
    connect() {
      console.log("[GEODE] Connecting to geode microservice...");
      this.set_ping();
      return Promise.resolve();
    },
    request(
      { schema, params = {} }: { schema: JsonRpcSchema; params?: Record<string, unknown> },
      callbacks: RequestHandlers = {},
    ) {
      return api_fetch(
        this,
        { schema, params, headers: {} },
        {
          ...callbacks,
          response_function: async (response: unknown) => {
            if (callbacks.response_function) {
              await callbacks.response_function(response);
            }
          },
        },
      );
    },
    upload(file: File, callbacks: RequestHandlers = {}) {
      const schema = back_schemas.opengeodeweb_back.upload_file;
      return upload_file(
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
    },
    get_version(schema: JsonRpcSchema | undefined) {
      if (!schema) {
        return;
      }
      return this.request(
        { schema },
        {
          response_function: (response: unknown) => {
            const { microservice_version } = response as { microservice_version: string };
            this.version = microservice_version;
          },
        },
      );
    },
  },
  share: {
    omit: ["status"],
  },
});
