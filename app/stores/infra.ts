import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_shared/app_mode";
import { setAppBaseUrl } from "@ogw_shared/scripts";
import { useCloudStore } from "@ogw_front/stores/cloud";

interface ElectronApi {
  electronAPI: {
    project_folder_path: (args: { projectFolderPath: string }) => void;
  };
}

declare global {
  // oxlint-disable-next-line no-var -- required for global augmentation
  var electronAPI: ElectronApi["electronAPI"];
}

export const useInfraStore = defineStore("infra", {
  state: () => ({
    app_mode: useRuntimeConfig().public.MODE,
    status: Status.NOT_CREATED,
    microservices: [] as Microservice[],
    domain_name: globalThis.location.hostname,
  }),
  getters: {
    microservices_connected(): boolean {
      return this.microservices.every((store: Microservice) => store.status === Status.CONNECTED);
    },
    microservices_busy(): boolean {
      return this.microservices.some((store: Microservice) => store.is_busy === true);
    },
  },
  actions: {
    register_microservice(store: Microservice) {
      const store_name = store.$id;

      if (
        !this.microservices.some((microservice: Microservice) => microservice.$id === store_name)
      ) {
        this.microservices.push(store);
      }
    },
    unregister_microservice(microserviceId: string) {
      this.microservices = this.microservices.filter(
        (microservice: Microservice) => microservice.$id !== microserviceId,
      );
    },
    async create_backend(email?: string) {
      if (this.status === Status.CREATED) {
        return undefined;
      }
      await navigator.locks.request("infra.create_backend", async () => {
        if (this.status === Status.CREATED) {
          return;
        }
        this.status = Status.CREATING;
        if (this.app_mode === appMode.CLOUD) {
          const cloudStore = useCloudStore();
          await cloudStore.launch(email ?? "");
        } else {
          const { useAppStore } = await import("@ogw_front/stores/app");
          const appStore = useAppStore();
          await appStore.createProjectFolder();
          if (this.app_mode === appMode.DESKTOP) {
            globalThis.electronAPI.project_folder_path({
              projectFolderPath: appStore.projectFolderPath,
            });
          }
          await setAppBaseUrl(appStore.base_url);
          const microservices_with_launch = this.microservices.filter(
            (store: Microservice) => store.launch,
          );
          const launch_promises = microservices_with_launch.map(async (store: Microservice) => {
            const result = await store.launch?.({
              projectFolderPath: appStore.projectFolderPath,
            });
            return result;
          });
          const { registerRunningExtensions } = await import("@ogw_front/utils/extension");
          launch_promises.push(registerRunningExtensions());
          await Promise.all(launch_promises);
        }
        this.status = Status.CREATED;
        return this.create_connection();
      });
      return undefined;
    },
    async create_connection() {
      await Promise.all(
        this.microservices.map(async (store: Microservice) => {
          await store.connect();
        }),
      );
    },
  },
  share: {
    omit: ["microservices"],
  },
});

export interface Microservice {
  $id: string;
  status?: string;
  is_busy?: boolean;
  launch?: (params: Record<string, unknown>) => Promise<unknown>;
  connect: () => Promise<void>;
}
