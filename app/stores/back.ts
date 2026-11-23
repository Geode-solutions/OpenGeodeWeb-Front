import { getRestApiPort, getRestApiProtocol, isCloudMode } from "@ogw_front/utils/stores";
import {
  useHttpTransport,
  useMicroserviceVersion,
  usePing,
  useRequestCounter,
} from "@ogw_internal/stores/microservice";
import type { RequestHandlers } from "@ogw_shared/utils/types.js";
import { Status } from "@ogw_front/utils/status";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";
import { useAppStore } from "@ogw_front/stores/app";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useInfraStore } from "@ogw_front/stores/infra";

export const useBackStore = defineStore(
  "back",
  // oxlint-disable-next-line max-lines-per-function
  () => {
    const default_local_port = ref("5000");
    const status = ref(Status.NOT_CONNECTED);

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

    const counter = useRequestCounter();
    const { request_counter, is_busy, start_request, stop_request } = counter;
    const transport = useHttpTransport("back", base_url, counter);
    const { request } = transport;
    const { version, get_version } = useMicroserviceVersion(request);

    // The status and the server error banner always change together
    function set_connected(connected: boolean): void {
      useFeedbackStore().set_server_error(!connected);
      status.value = connected ? Status.CONNECTED : Status.NOT_CONNECTED;
    }

    async function ping(): Promise<unknown> {
      const result = await request(
        { schema: back_schemas.opengeodeweb_back.ping },
        {
          request_error_function: () => {
            set_connected(false);
          },
          response_function: () => {
            set_connected(true);
          },
          response_error_function: () => {
            set_connected(false);
          },
        },
      );
      return result;
    }

    const { start_ping, stop_ping } = usePing(ping);

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

    function connect(): void {
      start_ping();
    }

    async function upload(file: File, callbacks: RequestHandlers = {}): Promise<unknown> {
      const schema = back_schemas.opengeodeweb_back.upload_file;
      const result = await transport.upload({ schema, file }, callbacks);
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
      ping,
      start_ping,
      stop_ping,
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
