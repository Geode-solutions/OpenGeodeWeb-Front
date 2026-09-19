// Node.js imports

// Third party imports

// Local imports
import type { RegisterableStore, useAppStore } from "@ogw_front/stores/app";
import type { Microservice } from "@ogw_front/stores/infra";
import { isCloudMode } from "@ogw_front/utils/stores";
import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_schemas.json" with { type: "json" };

interface ExtensionDescriptor {
  id: string;
  name: string;
  version: string;
  frontendContent: string;
  port: string;
}

interface DownloadExtensionParams {
  url: string;
  extensionFileName: string;
}

type AppStoreInstance = ReturnType<typeof useAppStore>;
type ExtensionModuleType = Awaited<ReturnType<AppStoreInstance["loadExtension"]>>;
interface RegisteredExtension {
  name: string;
  version: string;
  extensionModule: ExtensionModuleType;
}

async function uploadExtension(file: Readonly<File>): Promise<void> {
  const { useAppStore } = await import("@ogw_front/stores/app");
  const appStore = useAppStore();
  await appStore.upload(file);
}

async function runExtensions(): Promise<{ extensionsArray: ExtensionDescriptor[] }> {
  const { useAppStore } = await import("@ogw_front/stores/app");
  const appStore = useAppStore();
  const { projectFolderPath } = appStore;
  const { PROJECT: projectName } = useRuntimeConfig().public;
  const schema = isCloudMode()
    ? opengeodeweb_front_schemas.api.cloud.extensions.run
    : opengeodeweb_front_schemas.api.local.extensions.run;
  const params = {
    projectFolderPath,
    projectName,
  };
  const result = await appStore.request<{ extensionsArray: ExtensionDescriptor[] }>({
    schema,
    params,
  });
  return result;
}

async function downloadExtension({
  url,
  extensionFileName,
}: Readonly<DownloadExtensionParams>): Promise<unknown> {
  const { useAppStore } = await import("@ogw_front/stores/app");
  const appStore = useAppStore();
  const { PROJECT: projectName } = useRuntimeConfig().public;
  const schema = opengeodeweb_front_schemas.api.microservice.extensions.download;
  const params = {
    projectName,
    url,
    extensionFileName,
  };
  const result = await appStore.request({
    schema,
    params,
  });
  return result;
}

function isMicroservice(
  store: Readonly<RegisterableStore>,
): store is RegisterableStore & Microservice {
  return typeof store.connect === "function";
}

async function registerRunningExtensions(): Promise<RegisteredExtension[]> {
  const { useAppStore } = await import("@ogw_front/stores/app");
  const { useInfraStore } = await import("@ogw_front/stores/infra");
  const appStore = useAppStore();
  const infraStore = useInfraStore();
  const { extensionsArray } = await runExtensions();
  return Promise.all(
    extensionsArray.map(async (extension: Readonly<ExtensionDescriptor>) => {
      const { id, name, version, frontendContent, port } = extension;
      const blob = new Blob([frontendContent], {
        type: "application/javascript",
      });
      const blobUrl = URL.createObjectURL(blob);
      const extensionModule = await appStore.loadExtension(blobUrl, port);
      console.log("[ExtensionManager] Extension loaded:", id);
      const storeFactory = extensionModule.metadata.store;
      const store = storeFactory();
      appStore.registerStore(store);
      console.log("[ExtensionManager] Store registered:", store.$id);
      // Extension-provided stores are expected to satisfy the fuller
      // Microservice contract (connect, etc.) even though the loader's own
      // RegisterableStore type only models what app.ts itself needs.
      if (isMicroservice(store)) {
        infraStore.register_microservice(store);
      } else {
        console.warn("[ExtensionManager] Store does not implement Microservice:", store.$id);
      }
      return {
        name,
        version,
        extensionModule,
      };
    }),
  );
}

async function importExtensionFile(file: Readonly<File>): Promise<RegisteredExtension[]> {
  await uploadExtension(file);
  return registerRunningExtensions();
}

async function importExtensionURL(
  url: Readonly<DownloadExtensionParams>,
): Promise<RegisteredExtension[]> {
  await downloadExtension(url);
  return registerRunningExtensions();
}

async function unloadExtension(extensionId: string): Promise<boolean> {
  const { useAppStore } = await import("@ogw_front/stores/app");
  const appStore = useAppStore();
  console.log("[ExtensionManager] Unloading extension:", extensionId);
  const extensionData = appStore.getExtension(extensionId);
  if (!extensionData) {
    console.warn("[ExtensionManager] Extension not found:", extensionId);
    return false;
  }

  // Get the store if it exists
  const storeFactory = extensionData.metadata?.store;
  if (storeFactory !== undefined) {
    const store = storeFactory();
    // Stop the microservice if possible
    if (store.kill) {
      await store.kill();
    }
  }

  // Unload from AppStore
  await appStore.unloadExtension(extensionId);
  console.log("[ExtensionManager] Extension unloaded:", extensionId);
  return true;
}

async function killExtension(extensionId: string): Promise<unknown> {
  const { useAppStore } = await import("@ogw_front/stores/app");
  const appStore = useAppStore();
  const { projectFolderPath } = appStore;
  const { PROJECT: projectName } = useRuntimeConfig().public;
  const schema = opengeodeweb_front_schemas.api.local.extensions.kill;
  const params = {
    extensionId,
    projectFolderPath,
    projectName,
  };
  const result = await appStore.request({
    schema,
    params,
  });
  return result;
}
export {
  importExtensionFile,
  importExtensionURL,
  killExtension,
  registerRunningExtensions,
  runExtensions,
  unloadExtension,
  uploadExtension,
};
