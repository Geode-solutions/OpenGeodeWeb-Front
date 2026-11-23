import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_shared/app_mode";
import { setAppBaseUrl } from "@ogw_shared/scripts";
import { useCloudStore } from "@ogw_front/stores/cloud";

const LOCALHOST = "localhost";
const IPV4_LOOPBACK = "127.0.0.1";

interface ElectronApi {
  electronAPI: {
    project_folder_path: (args: { projectFolderPath: string }) => void;
  };
}

declare global {
  // oxlint-disable-next-line no-var -- required for global augmentation
  var electronAPI: ElectronApi["electronAPI"];
}

async function launchLocalServices(
  currentMode: string,
  microservices: readonly Microservice[],
): Promise<void> {
  const { useAppStore } = await import("@ogw_front/stores/app");
  const appStore = useAppStore();
  await appStore.createProjectFolder();
  if (currentMode === appMode.DESKTOP) {
    globalThis.electronAPI.project_folder_path({
      projectFolderPath: appStore.projectFolderPath,
    });
  }
  await setAppBaseUrl(appStore.base_url);
  const microservices_with_launch = microservices.filter((store: Microservice) => store.launch);
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

export const useInfraStore = defineStore(
  "infra",
  // oxlint-disable-next-line max-lines-per-function
  () => {
    const app_mode = ref(useRuntimeConfig().public.MODE);
    const status = ref(Status.NOT_CREATED);
    const microservices = ref<Microservice[]>([]);
    const domain_name = ref(globalThis.location.hostname);

    const microservices_connected = computed(() =>
      microservices.value.every((store: Microservice) => store.status === Status.CONNECTED),
    );
    const microservices_busy = computed(() =>
      microservices.value.some((store: Microservice) => store.is_busy === true),
    );
    // The local Flask microservices (Werkzeug) only listen on IPv4. With "localhost", browsers try ::1 first.
    // Windows is slow to refuse it: every request to them would pay that delay.
    // The page host stays in domain_name: the app store must remain same-origin (its API has no CORS).
    const microservice_domain_name = computed(() =>
      domain_name.value === LOCALHOST ? IPV4_LOOPBACK : domain_name.value,
    );

    function register_microservice(store: Microservice): void {
      const store_name = store.$id;
      if (!microservices.value.some((microservice) => microservice.$id === store_name)) {
        microservices.value.push(store);
      }
    }

    function unregister_microservice(microserviceId: string): void {
      microservices.value = microservices.value.filter(
        (microservice) => microservice.$id !== microserviceId,
      );
    }

    async function create_connection(): Promise<void> {
      await Promise.all(
        microservices.value.map(async (store: Microservice) => {
          await store.connect();
        }),
      );
    }

    async function create_backend(authToken?: string): Promise<undefined> {
      if (status.value === Status.CREATED) {
        return undefined;
      }
      await navigator.locks.request("infra.create_backend", async () => {
        if (status.value === Status.CREATED) {
          return;
        }
        status.value = Status.CREATING;
        if (app_mode.value === appMode.CLOUD) {
          const cloudStore = useCloudStore();
          try {
            await cloudStore.start(authToken);
          } catch (error) {
            // Back to the "Load the app" button so the user is not stuck on the loading screen.
            status.value = Status.NOT_CREATED;
            throw error;
          }
        } else {
          await launchLocalServices(app_mode.value, microservices.value);
        }
        status.value = Status.CREATED;
        await create_connection();
      });
      return undefined;
    }

    return {
      app_mode,
      status,
      microservices,
      domain_name,
      microservices_connected,
      microservices_busy,
      microservice_domain_name,
      register_microservice,
      unregister_microservice,
      create_backend,
      create_connection,
    };
  },
  {
    share: {
      omit: ["microservices"],
    },
  },
);

export interface Microservice {
  $id: string;
  status?: string;
  is_busy?: boolean;
  launch?: (params: { projectFolderPath: string }) => Promise<unknown>;
  connect: () => Promise<void>;
}
