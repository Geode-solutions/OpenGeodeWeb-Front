import { clearCloudUrlParam, getCloudUrlParam } from "@ogw_front/utils/cloud";
import { Status } from "@ogw_front/utils/status";
import { api_fetch } from "@ogw_internal/utils/api_fetch";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import cloud_api_schemas from "@geode/cloud-api/cloud_api_typed_schemas.js";
import { setAppBaseUrl } from "@ogw_shared/scripts";
import { useAPIStore } from "@ogw_front/stores/api";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const run_cloud_schema = cloud_api_schemas.cloud_api.cloud.run;

export const useCloudStore = defineStore(
  "cloud",
  // oxlint-disable-next-line max-lines-per-function
  () => {
    const status = ref(Status.NOT_CONNECTED);

    // The status and the server error banner always change together
    function set_connected(connected: boolean): void {
      useFeedbackStore().set_server_error(!connected);
      status.value = connected ? Status.CONNECTED : Status.NOT_CONNECTED;
    }

    async function on_connected(url: string): Promise<void> {
      const { useAppStore } = await import("./app");
      const { useInfraStore } = await import("./infra");
      const appStore = useAppStore();
      set_connected(true);
      useInfraStore().$patch({
        domain_name: url,
      });
      appStore.$patch({
        projectFolderPath: "/project",
      });
      await setAppBaseUrl(appStore.base_url);
    }

    // `authToken` is the user's Firebase ID token, checked by the Cloud API
    async function launch(authToken: string): Promise<unknown> {
      status.value = Status.CONNECTING;
      const { PROJECT, BRANCH } = useRuntimeConfig().public;
      const params = { project: PROJECT, branch: BRANCH };
      const headers = { Authorization: `Bearer ${authToken}` };
      const APIStore = useAPIStore();
      const result = await APIStore.request(
        { schema: run_cloud_schema, params, headers },
        {
          request_error_function: () => {
            set_connected(false);
          },
          response_function: async ({ url }) => {
            await on_connected(url);
          },
          response_error_function: () => {
            set_connected(false);
          },
        },
      );
      return result;
    }

    async function connect_existing(host: string): Promise<void> {
      status.value = Status.CONNECTING;
      const { useBackStore } = await import("./back");
      const backStore = useBackStore();
      // Probe the candidate host directly so domain_name is only updated once the service answers.
      try {
        await api_fetch(
          {
            $id: backStore.$id,
            base_url: backStore.base_url_for(host),
            start_request: () => {
              backStore.start_request();
            },
            stop_request: () => {
              backStore.stop_request();
            },
          },
          { schema: back_schemas.opengeodeweb_back.ping },
        );
      } catch (error) {
        set_connected(false);
        throw error;
      }
      await on_connected(host);
    }

    // Reuses the running service given by `?cloud_url=` when present, otherwise launches a new one.
    // The param is single use: it is cleared whatever the outcome, so a retry launches a new service.
    async function start(authToken?: string): Promise<void> {
      const existing_host = getCloudUrlParam();
      if (existing_host === undefined) {
        if (authToken === undefined) {
          throw new Error("Launching a cloud service requires an authenticated user");
        }
        await launch(authToken);
        return;
      }
      try {
        await connect_existing(existing_host);
      } finally {
        clearCloudUrlParam();
      }
    }

    function connect(): void {
      status.value = Status.CONNECTED;
    }

    return {
      status,
      start,
      launch,
      connect_existing,
      on_connected,
      connect,
    };
  },
  {
    share: {
      omit: ["status"],
    },
  },
);
