// Node.js imports

// Third party imports
import _ from "lodash";

// Local imports
import { isCloudMode } from "@ogw_front/utils/stores";
import { useAppStore } from "@ogw_front/stores/app";
import { useInfraStore } from "@ogw_front/stores/infra";

import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_schemas.json" with { type: "json" };;

async function importExtensionFile(file) {
  await uploadExtension(file);
  return registerRunningExtensions();
}

async function importExtensionURL(url) {
  await downloadExtension(url);
  return registerRunningExtensions();
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
      infraStore.register_microservice(store);

      return {
        name,
        version,
        extensionModule,
      };
    }),
  );
}

async function unloadExtension(extensionId) {
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
      await store.kill();
    }
  }

  // Unload from AppStore
  appStore.unloadExtension(extensionId);

  console.log("[ExtensionManager] Extension unloaded:", extensionId);
  return true;
}

async function uploadExtension(file) {
  const appStore = useAppStore();
  await appStore.upload(file);
}

function downloadExtension({ url, extensionFileName }) {
  const appStore = useAppStore();
  const { PROJECT: projectName } = useRuntimeConfig().public;
  const schema = opengeodeweb_front_schemas.api.microservice.extensions.download;
  const params = { projectName, url, extensionFileName };
  return appStore.request({ schema, params });
}

function runExtensions() {
  const appStore = useAppStore();
  const { projectFolderPath } = appStore;
  const { PROJECT: projectName } = useRuntimeConfig().public;
  const schema = isCloudMode()
    ? opengeodeweb_front_schemas.api.cloud.extensions.run
    : opengeodeweb_front_schemas.api.local.extensions.run;
  const params = { projectFolderPath, projectName };
  return appStore.request({ schema, params });
}

function killExtension(extensionId) {
  const appStore = useAppStore();
  const { projectFolderPath } = appStore;
  const { PROJECT: projectName } = useRuntimeConfig().public;
  const schema = opengeodeweb_front_schemas.api.local.extensions.kill;
  const params = { extensionId, projectFolderPath, projectName };
  return appStore.request({ schema, params });
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
