import { Status } from "@ogw_front/utils/status";
import { fetchSchema } from "@ogw_shared/utils/fetch_schema";
import { setAppBaseUrl } from "@ogw_shared/scripts";

import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_schemas.json" with { type: "json" };

export const useCloudStore = defineStore("cloud", {
  state: () => ({
    status: Status.NOT_CONNECTED,
  }),
  actions: {
    async launch(email: string) {
      this.status = Status.CONNECTING;
      const schema = opengeodeweb_front_schemas.api.serverless.run_cloud;
      const params = { email };
      const { useAppStore } = await import("./app");
      const { useFeedbackStore } = await import("./feedback");
      const appStore = useAppStore();
      const feedbackStore = useFeedbackStore();
      const result = await fetchSchema(
        { schema, params },
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
