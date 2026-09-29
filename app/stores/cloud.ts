import { Status } from "@ogw_front/utils/status";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
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

const CLOUD_URL_PARAM = "cloud_url";
const CLOUD_RUN_HOST_SUFFIX = ".run.app";

// Hostname of an already running Cloud Run service passed as `?cloud_url=`, restricted to Cloud Run hosts so a crafted link cannot point the app at an arbitrary server.
function cloud_url_param(): string | undefined {
  const value = new URLSearchParams(globalThis.location.search).get(CLOUD_URL_PARAM);
  if (value === null || value === "") {
    return undefined;
  }
  const url_string = value.includes("://") ? value : `https://${value}`;
  let hostname = "";
  try {
    ({ hostname } = new URL(url_string));
  } catch {
    console.warn(`[Cloud] Invalid ${CLOUD_URL_PARAM}:`, value);
    return undefined;
  }
  if (!hostname.endsWith(CLOUD_RUN_HOST_SUFFIX)) {
    console.warn(`[Cloud] Ignoring ${CLOUD_URL_PARAM}, not a Cloud Run host:`, hostname);
    return undefined;
  }
  return hostname;
}

const useCloudStore = defineStore("cloud", {
  state: () => ({
    status: Status.NOT_CONNECTED,
  }),
  actions: {
    // Reuses the running service given by `?cloud_url=` when present, otherwise launches a new one.
    async start(email: string) {
      const existing_host = cloud_url_param();
      if (existing_host === undefined) {
        await this.launch(email);
        return;
      }
      await this.connect_existing(existing_host);
    },
    async launch(email: string) {
      this.status = Status.CONNECTING;
      const { PROJECT, BRANCH } = useRuntimeConfig().public;
      const params = { email, project: PROJECT, branch: BRANCH };
      const { useFeedbackStore } = await import("./feedback");
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
      const { useFeedbackStore } = await import("./feedback");
      const { useInfraStore } = await import("./infra");
      const { useBackStore } = await import("./back");
      const feedbackStore = useFeedbackStore();
      const infraStore = useInfraStore();
      const previous_domain_name = infraStore.domain_name;
      // The back store builds its base URL from domain_name, so point it at the candidate host before probing.
      infraStore.$patch({ domain_name: host });
      try {
        await useBackStore().request({ schema: back_schemas.opengeodeweb_back.ping });
      } catch (error) {
        infraStore.$patch({ domain_name: previous_domain_name });
        feedbackStore.$patch({ server_error: true });
        this.status = Status.NOT_CONNECTED;
        throw error;
      }
      await this.on_connected(host);
    },
    async on_connected(url: string) {
      const { useAppStore } = await import("./app");
      const { useFeedbackStore } = await import("./feedback");
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

export { cloud_url_param, useCloudStore };
