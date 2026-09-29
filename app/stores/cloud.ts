import { clearCloudUrlParam, getCloudUrlParam } from "@ogw_front/utils/cloud";
import { Status } from "@ogw_front/utils/status";
import { api_fetch } from "@ogw_internal/utils/api_fetch";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { setAppBaseUrl } from "@ogw_shared/scripts";
import { useAPIStore } from "@ogw_front/stores/api";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const run_cloud_schema = {
  $id: "/cloud/run",
  methods: ["POST"],
  type: "object",
  properties: {
    email: { type: "string" },
    project: { type: "string" },
    branch: { type: "string" },
  },
  required: ["email", "project", "branch"],
  additionalProperties: false,
};

export const useCloudStore = defineStore("cloud", {
  state: () => ({
    status: Status.NOT_CONNECTED,
  }),
  actions: {
    // Reuses the running service given by `?cloud_url=` when present, otherwise launches a new one.
    // The param is single use: it is cleared whatever the outcome, so a retry launches a new service.
    async start(email: string) {
      const existing_host = getCloudUrlParam();
      if (existing_host === undefined) {
        await this.launch(email);
        return;
      }
      try {
        await this.connect_existing(existing_host);
      } finally {
        clearCloudUrlParam();
      }
    },
    async launch(email: string) {
      this.status = Status.CONNECTING;
      const { PROJECT, BRANCH } = useRuntimeConfig().public;
      const params = { email, project: PROJECT, branch: BRANCH };
      const feedbackStore = useFeedbackStore();
      const APIStore = useAPIStore();
      const result = await APIStore.request(
        { schema: run_cloud_schema, params },
        {
          request_error_function: () => {
            feedbackStore.$patch({ server_error: true });
            this.status = Status.NOT_CONNECTED;
          },
          response_function: async (response: unknown) => {
            if (
              typeof response !== "object" ||
              response === null ||
              !("url" in response) ||
              typeof response.url !== "string"
            ) {
              return;
            }
            await this.on_connected(response.url);
          },
          response_error_function: () => {
            feedbackStore.$patch({ server_error: true });
            this.status = Status.NOT_CONNECTED;
          },
        },
      );
      return result;
    },
    async connect_existing(host: string) {
      this.status = Status.CONNECTING;
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
        useFeedbackStore().$patch({ server_error: true });
        this.status = Status.NOT_CONNECTED;
        throw error;
      }
      await this.on_connected(host);
    },
    async on_connected(url: string) {
      const { useAppStore } = await import("./app");
      const { useInfraStore } = await import("./infra");
      const appStore = useAppStore();
      useFeedbackStore().$patch({ server_error: false });
      this.status = Status.CONNECTED;
      useInfraStore().$patch({
        domain_name: url,
      });
      appStore.$patch({
        projectFolderPath: "/project",
      });
      await setAppBaseUrl(appStore.base_url);
    },
    connect() {
      this.status = Status.CONNECTED;
    },
  },
  share: {
    omit: ["status"],
  },
});
