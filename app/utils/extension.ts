// Node.js imports

// Third party imports

// Local imports
import { isCloudMode } from "@ogw_front/utils/stores";
import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_schemas.json" with { type: "json" };
import { useAppStore } from "@ogw_front/stores/app";
import { useInfraStore } from "@ogw_front/stores/infra";
// oxlint-disable-next-line eslint/no-duplicate-imports
import type { Microservice } from "@ogw_front/stores/infra";

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

async function uploadExtension(file: File): Promise<void> {
  const appStore = useAppStore();
  await appStore.upload(file);
}

function runExtensions() {
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
  return appStore.request({
    schema,
    params,
  }) as Promise<{ extensionsArray: ExtensionDescriptor[] }>;
}

function downloadExtension({ url, extensionFileName }: DownloadExtensionParams) {
  const appStore = useAppStore();
  const { PROJECT: projectName } = useRuntimeConfig().public;
  const schema = opengeodeweb_front_schemas.api.microservice.extensions.download;
  const params = {
    projectName,
    url,
    extensionFileName,
  };
  return appStore.request({
    schema,
    params,
  });
}

async function registerRunningExtensions() {
  const appStore = useAppStore();
  const infraStore = useInfraStore();
  const { extensionsArray } = await runExtensions();
  return Promise.all(
    extensionsArray.map(async (extension) => {
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
      infraStore.register_microservice(store as unknown as Microservice);
      return {
        name,
        version,
        extensionModule,
      };
    }),
  );
}

async function importExtensionFile(file: File) {
  await uploadExtension(file);
  return registerRunningExtensions();
}

async function importExtensionURL(url: DownloadExtensionParams) {
  await downloadExtension(url);
  return registerRunningExtensions();
}

async function unloadExtension(extensionId: string): Promise<boolean> {
  const appStore = useAppStore();
  console.log("[ExtensionManager] Unloading extension:", extensionId);
  const extensionData = appStore.getExtension(extensionId);
  if (!extensionData) {
    console.warn("[ExtensionManager] Extension not found:", extensionId);
    return false;
  }

  // Get the store if it exists
  const storeFactory = extensionData.metadata?.store;
  if (storeFactory) {
    const store = storeFactory();
    // Stop the microservice if possible
    if (typeof store.kill === "function") {
      await (store.kill as () => Promise<void>)();
    }
  }

  // Unload from AppStore
  appStore.unloadExtension(extensionId);
  console.log("[ExtensionManager] Extension unloaded:", extensionId);
  return true;
}

function killExtension(extensionId: string) {
  const appStore = useAppStore();
  const { projectFolderPath } = appStore;
  const { PROJECT: projectName } = useRuntimeConfig().public;
  const schema = opengeodeweb_front_schemas.api.local.extensions.kill;
  const params = {
    extensionId,
    projectFolderPath,
    projectName,
  };
  return appStore.request({
    schema,
    params,
  });
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
