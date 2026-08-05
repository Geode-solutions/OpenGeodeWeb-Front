import { Status } from "@ogw_front/utils/status";
import { fetchSchema } from "@ogw_shared/utils/fetch_schema";
import { setAppBaseUrl } from "@ogw_shared/scripts";
import { useAppStore } from "./app";
import { useFeedbackStore } from "./feedback";
import { useInfraStore } from "./infra";

export const useCloudStore = defineStore("cloud", {
  state: () => ({
    status: Status.NOT_CONNECTED,
  }),
  actions: {
    launch(email) {
      this.status = Status.CONNECTING;
      console.log("[CLOUD] Launching cloud backend...");
      const schema = {
        $id: "/api/serverless/run_cloud",
        methods: ["POST"],
        type: "object",
        properties: {
          email: { type: "string" },
        },
        required: ["email"],
        additionalProperties: true,
      };
      const params = { email };
      console.log("[CLOUD] params", params);
      const appStore = useAppStore();
      const feedbackStore = useFeedbackStore();
      return fetchSchema(
        { schema, params },
        {
          request_error_function: () => {
            feedbackStore.$patch({ server_error: true });
            this.status = Status.NOT_CONNECTED;
          },
          response_function: (response) => {
            feedbackStore.$patch({ server_error: false });
            console.log(`[CLOUD] Cloud launched on ${response.url}`);
            this.status = Status.CONNECTED;
            const infraStore = useInfraStore();
            infraStore.$patch({
              domain_name: response.url,
            });
            setAppBaseUrl(appStore.base_url);
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
    },
    connect() {
      console.log("[CLOUD] Cloud connected");
      this.status = Status.CONNECTED;
      return Promise.resolve();
    },
  },
  share: {
    omit: ["status"],
  },
});
