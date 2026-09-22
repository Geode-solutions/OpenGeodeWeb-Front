import { killExtension } from "@ogw_front/utils/extension.js";
import { useInfraStore } from "@ogw_front/stores/infra";

import type { RegisterableStore } from "@ogw_front/stores/app";

interface ExtensionMetadata {
  id: string;
  store: () => RegisterableStore;
  [key: string]: unknown;
}

interface ExtensionModule {
  metadata: ExtensionMetadata;
  install: (api: unknown, backendPath?: string) => Promise<void>;
  [key: string]: unknown;
}

interface ExtensionData {
  module: ExtensionModule;
  id: string;
  path: string;
  backendPath: string | undefined;
  loadedAt: string;
  metadata: ExtensionMetadata;
  enabled: boolean;
}

// oxlint-disable-next-line max-lines-per-function, max-statements
export function useAppExtensions(): {
  loadedExtensions: typeof loadedExtensions;
  extensionAPI: typeof extensionAPI;
  setExtensionAPI: typeof setExtensionAPI;
  setCodeTransformer: typeof setCodeTransformer;
  getExtension: typeof getExtension;
  loadExtension: typeof loadExtension;
  getLoadedExtensions: typeof getLoadedExtensions;
  unloadExtension: typeof unloadExtension;
  toggleExtension: typeof toggleExtension;
  setExtensionEnabled: typeof setExtensionEnabled;
  getExtensionEnabled: typeof getExtensionEnabled;
} {
  const loadedExtensions = ref<Map<string, ExtensionData>>(new Map());
  const extensionAPI = ref<unknown>(undefined);
  const codeTransformer = ref<((code: string) => string) | undefined>(undefined);

  function setExtensionAPI(api: unknown): void {
    extensionAPI.value = api;
  }

  function setCodeTransformer(transformer: (code: string) => string): void {
    codeTransformer.value = transformer;
  }

  function getExtension(id: string): ExtensionData | undefined {
    return loadedExtensions.value.get(id);
  }

  async function loadExtension(
    path: string,
    extensionPort: string,
    backendPath?: string,
  ): Promise<ExtensionModule> {
    try {
      let finalURL = path;

      if (codeTransformer.value && path.startsWith("blob:")) {
        const response = await fetch(path);
        const code = await response.text();
        const transformedCode = codeTransformer.value(code);

        const newBlob = new Blob([transformedCode], {
          type: "application/javascript",
        });
        finalURL = URL.createObjectURL(newBlob);
      }
      // oxlint-disable-next-line no-inline-comments, no-unsafe-assignment
      const extensionModule: ExtensionModule = await import(/* @vite-ignore */ finalURL);
      const store = extensionModule.metadata.store();
      store.$patch?.({ default_local_port: extensionPort });

      if (finalURL !== path && finalURL.startsWith("blob:")) {
        URL.revokeObjectURL(finalURL);
      }

      if (!extensionModule.metadata?.id) {
        throw new Error("Extension must have metadata.id");
      }

      const extensionId = extensionModule.metadata.id;

      if (loadedExtensions.value.has(extensionId)) {
        console.warn(`[AppStore] Extension "${extensionId}" is already loaded`);
        throw new Error(`Extension "${extensionId}" is already loaded.`);
      }

      if (extensionAPI.value === undefined) {
        throw new Error("Extension API not initialized");
      }

      if (typeof extensionModule.install !== "function") {
        throw new TypeError("Extension must export an install function");
      }

      await extensionModule.install(extensionAPI.value, backendPath);

      const extensionData: ExtensionData = {
        module: extensionModule,
        id: extensionId,
        path,
        backendPath,
        loadedAt: new Date().toISOString(),
        metadata: extensionModule.metadata,
        enabled: true,
      };
      loadedExtensions.value.set(extensionId, extensionData);

      console.log(`[AppStore] Extension loaded successfully: ${extensionId}`);
      return extensionModule;
    } catch (error) {
      console.error(`[AppStore] Failed to load extension from ${path}:`, error);
      throw error;
    }
  }

  function getLoadedExtensions(): ExtensionData[] {
    return [...loadedExtensions.value.values()];
  }

  async function unloadExtension(extensionId: string): Promise<boolean> {
    console.log(`[AppStore] Unloading extension: ${extensionId}`);
    const infraStore = useInfraStore();
    infraStore.unregister_microservice(extensionId);
    await killExtension(extensionId);

    loadedExtensions.value.delete(extensionId);
    console.log(`[AppStore] Extension unloaded: ${extensionId}`);
    return true;
  }

  function toggleExtension(extensionId: string): boolean {
    const extensionData = getExtension(extensionId);
    if (!extensionData) {
      return false;
    }
    extensionData.enabled = !extensionData.enabled;
    console.log(
      `[AppStore] Extension ${extensionData.enabled ? "enabled" : "disabled"}: ${extensionId}`,
    );
    return extensionData.enabled;
  }

  function setExtensionEnabled(extensionId: string, enabled: boolean): boolean {
    const extensionData = getExtension(extensionId);
    if (!extensionData) {
      return false;
    }
    extensionData.enabled = enabled;
    console.log(`[AppStore] Extension ${enabled ? "enabled" : "disabled"}: ${extensionId}`);
    return true;
  }

  function getExtensionEnabled(extensionId: string): boolean {
    return getExtension(extensionId)?.enabled ?? false;
  }

  return {
    loadedExtensions,
    extensionAPI,
    setExtensionAPI,
    setCodeTransformer,
    getExtension,
    loadExtension,
    getLoadedExtensions,
    unloadExtension,
    toggleExtension,
    setExtensionEnabled,
    getExtensionEnabled,
  };
}
