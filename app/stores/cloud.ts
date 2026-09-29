import { Status } from "@ogw_front/utils/status";
import { setAppBaseUrl } from "@ogw_shared/scripts";
import { useAPIStore } from "@ogw_front/stores/api";

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
    async launch(email: string) {
      this.status = Status.CONNECTING;
      const { PROJECT, BRANCH } = useRuntimeConfig().public;
      const params = { email, project: PROJECT, branch: BRANCH };
      const { useAppStore } = await import("./app");
      const { useFeedbackStore } = await import("./feedback");
      const appStore = useAppStore();
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
            const { url } = response;
            feedbackStore.$patch({ server_error: false });
            this.status = Status.CONNECTED;
            const { useInfraStore } = await import("./infra");
            const infraStore = useInfraStore();
            infraStore.$patch({
              domain_name: url,
            });
            setAppBaseUrl(appStore.base_url).catch(() => undefined);
            appStore.$patch({
              projectFolderPath: "/project",
            });
          },
          response_error_function: () => {
            feedbackStore.$patch({ server_error: true });
            this.status = Status.NOT_CONNECTED;
          },
        },
      );
      return result;
    },
    connect() {
      this.status = Status.CONNECTED;
    },
  },
  share: {
    omit: ["status"],
  },
});
