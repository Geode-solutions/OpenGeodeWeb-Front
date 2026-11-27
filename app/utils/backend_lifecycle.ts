// Creates the backend: launches the local microservices, or launches / reaches the cloud service,
// Then connects every registered microservice. It drives the stores from outside, so the stores
// Only hold their own state and no store imports another one to orchestrate it.
import { type Microservice, useInfraStore } from "@ogw_front/stores/infra";
import { clearCloudUrlParam, getCloudUrlParam } from "@ogw_front/utils/cloud";
import { Status } from "@ogw_front/utils/status";
import { api_fetch } from "@ogw_internal/utils/api_fetch";
import { appMode } from "@ogw_shared/app_mode";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import cloud_api_schemas from "@geode/cloud-api/cloud_api_typed_schemas.js";
import { registerRunningExtensions } from "@ogw_front/utils/extension";
import { setAppBaseUrl } from "@ogw_shared/scripts";
import { useAPIStore } from "@ogw_front/stores/api";
import { useAppStore } from "@ogw_front/stores/app";
import { useBackStore } from "@ogw_front/stores/back";
import { useCloudStore } from "@ogw_front/stores/cloud";

const CLOUD_PROJECT_FOLDER_PATH = "/project";

interface ElectronApi {
  electronAPI: {
    project_folder_path: (args: { projectFolderPath: string }) => void;
  };
}

declare global {
  // oxlint-disable-next-line no-var -- required for global augmentation
  var electronAPI: ElectronApi["electronAPI"];
}

async function launchLocalServices(): Promise<void> {
  const infraStore = useInfraStore();
  const appStore = useAppStore();
  await appStore.createProjectFolder();
  if (infraStore.app_mode === appMode.DESKTOP) {
    globalThis.electronAPI.project_folder_path({
      projectFolderPath: appStore.projectFolderPath,
    });
  }
  await setAppBaseUrl(appStore.base_url);
  const launch_promises: Promise<unknown>[] = infraStore.microservices
    .filter((store: Microservice) => store.launch)
    .map(async (store: Microservice) => {
      const result = await store.launch?.({ projectFolderPath: appStore.projectFolderPath });
      return result;
    });
  launch_promises.push(registerRunningExtensions());
  await Promise.all(launch_promises);
}

async function onCloudConnected(url: string): Promise<void> {
  const appStore = useAppStore();
  useCloudStore().set_connected(true);
  useInfraStore().set_domain_name(url);
  appStore.set_project_folder_path(CLOUD_PROJECT_FOLDER_PATH);
  await setAppBaseUrl(appStore.base_url);
}

// `authToken` is the user's Firebase ID token, checked by the Cloud API
async function launchCloud(authToken: string): Promise<unknown> {
  const cloudStore = useCloudStore();
  cloudStore.set_connecting();
  const { PROJECT, BRANCH } = useRuntimeConfig().public;
  const result = await useAPIStore().request(
    {
      schema: cloud_api_schemas.cloud_api.cloud.run,
      params: { project: PROJECT, branch: BRANCH },
      headers: { Authorization: `Bearer ${authToken}` },
    },
    {
      request_error_function: () => {
        cloudStore.set_connected(false);
      },
      response_function: async ({ url }) => {
        await onCloudConnected(url);
      },
      response_error_function: () => {
        cloudStore.set_connected(false);
      },
    },
  );
  return result;
}

async function connectExistingCloud(host: string): Promise<void> {
  const cloudStore = useCloudStore();
  cloudStore.set_connecting();
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
      { schema: back_schemas.opengeodeweb_back.ping, log_success: false },
    );
  } catch (error) {
    cloudStore.set_connected(false);
    throw error;
  }
  await onCloudConnected(host);
}

// Reuses the running service given by `?cloud_url=` when present, otherwise launches a new one.
// The param is single use: it is cleared whatever the outcome, so a retry launches a new service.
async function startCloud(authToken?: string): Promise<void> {
  const existing_host = getCloudUrlParam();
  if (existing_host === undefined) {
    if (authToken === undefined) {
      throw new Error("Launching a cloud service requires an authenticated user");
    }
    await launchCloud(authToken);
    return;
  }
  try {
    await connectExistingCloud(existing_host);
  } finally {
    clearCloudUrlParam();
  }
}

async function createBackend(authToken?: string): Promise<void> {
  const infraStore = useInfraStore();
  if (infraStore.status === Status.CREATED) {
    return;
  }
  await navigator.locks.request("infra.create_backend", async () => {
    if (infraStore.status === Status.CREATED) {
      return;
    }
    infraStore.set_status(Status.CREATING);
    if (infraStore.app_mode === appMode.CLOUD) {
      try {
        await startCloud(authToken);
      } catch (error) {
        // Back to the "Load the app" button so the user is not stuck on the loading screen.
        infraStore.set_status(Status.NOT_CREATED);
        throw error;
      }
    } else {
      await launchLocalServices();
    }
    infraStore.set_status(Status.CREATED);
    await infraStore.create_connection();
  });
}

export { connectExistingCloud, createBackend, launchCloud, startCloud };
