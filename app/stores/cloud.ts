import { Status } from "@ogw_front/utils/status";
import { fetchSchema } from "#shared/utils/fetch_schema";
import { setAppBaseUrl } from "#shared/scripts";
import { useAppStore } from "./app";
import { useFeedbackStore } from "./feedback";
import { useInfraStore } from "./infra";

import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_schemas.json" with { type: "json" };

export const useCloudStore = defineStore("cloud", {
  state: () => ({
    status: Status.NOT_CONNECTED,
  }),
  actions: {
    launch(email: string) {
      this.status = Status.CONNECTING;
      console.log("[CLOUD] Launching cloud backend...");
      const schema = opengeodeweb_front_schemas.api.serverless.run_cloud;
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
          response_function: (response: unknown) => {
            const { url } = response as { url: string };
            feedbackStore.$patch({ server_error: false });
            console.log(`[CLOUD] Cloud launched on ${url}`);
            this.status = Status.CONNECTED;
            const infraStore = useInfraStore();
            infraStore.$patch({
              domain_name: url,
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
