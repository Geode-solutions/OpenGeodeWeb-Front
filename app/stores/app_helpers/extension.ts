import { consola } from "consola";
import { killExtension } from "@ogw_front/utils/extension.js";
import { useInfraStore } from "@ogw_front/stores/infra";

import type { ExtensionId } from "@ogw_front/types/identifiers";
import type { FilePath } from "@ogw_front/types/files";
import type { RegisterableStore } from "@ogw_front/stores/app";

// What rewrites the code of an extension module before it is imported
type CodeTransformer = (code: string) => string;

interface ExtensionMetadata {
  id: ExtensionId;
  store: () => RegisterableStore;
  [key: string]: unknown;
}

interface ExtensionModule {
  metadata: ExtensionMetadata;
  install: (api: unknown, backendPath?: FilePath) => Promise<void>;
  [key: string]: unknown;
}

interface ExtensionData {
  module: ExtensionModule;
  id: ExtensionId;
  path: FilePath;
  backendPath: FilePath | undefined;
  loadedAt: string;
  metadata: ExtensionMetadata;
  enabled: boolean;
}

async function transformBlobUrl(
  path: FilePath,
  transformer: CodeTransformer | undefined,
): Promise<string> {
  if (!transformer || !path.startsWith("blob:")) {
    return path;
  }
  const response = await fetch(path);
  const code = await response.text();
  const transformedCode = transformer(code);

  const newBlob = new Blob([transformedCode], {
    type: "application/javascript",
  });
  return URL.createObjectURL(newBlob);
}

async function importExtensionModule(
  path: FilePath,
  transformer: CodeTransformer | undefined,
  extensionPort: string,
  serverPort?: string,
): Promise<ExtensionModule> {
  const finalURL = await transformBlobUrl(path, transformer);
  // oxlint-disable-next-line no-inline-comments, no-unsafe-assignment
  const extensionModule: ExtensionModule = await import(/* @vite-ignore */ finalURL);
  const store = extensionModule.metadata.store();
  store.$patch?.({
    default_local_port: extensionPort,
    ...(serverPort !== undefined && { nitro_port: serverPort }),
  });

  if (finalURL !== path && finalURL.startsWith("blob:")) {
    URL.revokeObjectURL(finalURL);
  }
  return extensionModule;
}

function validateExtensionModule(
  extensionModule: ExtensionModule,
  api: unknown,
  loaded: Map<ExtensionId, ExtensionData>,
): void {
  if (!extensionModule.metadata?.id) {
    throw new Error("Extension must have metadata.id");
  }

  const extensionId = extensionModule.metadata.id;

  if (loaded.has(extensionId)) {
    consola.warn(`[AppStore] Extension "${extensionId}" is already loaded`);
    throw new Error(`Extension "${extensionId}" is already loaded.`);
  }

  if (api === undefined) {
    throw new Error("Extension API not initialized");
  }

  if (typeof extensionModule.install !== "function") {
    throw new TypeError("Extension must export an install function");
  }
}

function createExtensionData(
  extensionModule: ExtensionModule,
  path: FilePath,
  backendPath: FilePath | undefined,
): ExtensionData {
  return {
    module: extensionModule,
    id: extensionModule.metadata.id,
    path,
    backendPath,
    loadedAt: new Date().toISOString(),
    metadata: extensionModule.metadata,
    enabled: true,
  };
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
  const loadedExtensions = ref<Map<ExtensionId, ExtensionData>>(new Map());
  const extensionAPI = ref<unknown>(undefined);
  const codeTransformer = ref<CodeTransformer | undefined>(undefined);

  function setExtensionAPI(api: unknown): void {
    extensionAPI.value = api;
  }

  function setCodeTransformer(transformer: CodeTransformer): void {
    codeTransformer.value = transformer;
  }

  function getExtension(id: ExtensionId): ExtensionData | undefined {
    return loadedExtensions.value.get(id);
  }

  async function loadExtension(
    path: FilePath,
    extensionPort: string,
    serverPort?: string,
    backendPath?: FilePath,
  ): Promise<ExtensionModule> {
    try {
      const extensionModule = await importExtensionModule(
        path,
        codeTransformer.value,
        extensionPort,
        serverPort,
      );
      validateExtensionModule(extensionModule, extensionAPI.value, loadedExtensions.value);
      const extensionId = extensionModule.metadata.id;

      await extensionModule.install(extensionAPI.value, backendPath);

      loadedExtensions.value.set(
        extensionId,
        createExtensionData(extensionModule, path, backendPath),
      );

      consola.info(`[AppStore] Extension loaded successfully: ${extensionId}`);
      return extensionModule;
    } catch (error) {
      consola.error(`[AppStore] Failed to load extension from ${path}:`, error);
      throw error;
    }
  }

  function getLoadedExtensions(): ExtensionData[] {
    return [...loadedExtensions.value.values()];
  }

  async function unloadExtension(extensionId: ExtensionId): Promise<boolean> {
    consola.info(`[AppStore] Unloading extension: ${extensionId}`);
    const infraStore = useInfraStore();
    infraStore.unregister_microservice(extensionId);
    await killExtension(extensionId);

    loadedExtensions.value.delete(extensionId);
    consola.info(`[AppStore] Extension unloaded: ${extensionId}`);
    return true;
  }

  function toggleExtension(extensionId: ExtensionId): boolean {
    const extensionData = getExtension(extensionId);
    if (!extensionData) {
      return false;
    }
    extensionData.enabled = !extensionData.enabled;
    consola.info(
      `[AppStore] Extension ${extensionData.enabled ? "enabled" : "disabled"}: ${extensionId}`,
    );
    return extensionData.enabled;
  }

  function setExtensionEnabled(extensionId: ExtensionId, enabled: boolean): boolean {
    const extensionData = getExtension(extensionId);
    if (!extensionData) {
      return false;
    }
    extensionData.enabled = enabled;
    consola.info(`[AppStore] Extension ${enabled ? "enabled" : "disabled"}: ${extensionId}`);
    return true;
  }

  function getExtensionEnabled(extensionId: ExtensionId): boolean {
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
