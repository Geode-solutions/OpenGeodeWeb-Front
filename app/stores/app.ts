// Local imports
import {
  type RegisterableStore,
  exportRegisteredStores,
  importRegisteredStores,
} from "./app_helpers/registry.js";
import { getRestApiPort, getRestApiProtocol, isCloudMode } from "@ogw_front/utils/stores.js";
import { useHttpTransport, useRequestCounter } from "@ogw_internal/stores/microservice";
import { Status } from "@ogw_front/utils/status";
import { useAppExtensions } from "./app_helpers/extension.js";
import { useInfraStore } from "@ogw_front/stores/infra";

import type { RequestHandlers } from "@ogw_shared/utils/types.js";
import type { StateTree } from "pinia";

import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_typed_schemas.js";

// The `share` defineStore option (used by every store in this codebase) is implemented by a runtime pinia plugin outside this package's type surface; this augmentation only teaches the type checker about the option shape already used at each defineStore call site.
declare module "pinia" {
  // TypeScript requires a merged interface declaration's type parameter names to match pinia's own (`S`, `Store`) exactly, not just their count.
  // oxlint-disable-next-line eslint/id-length
  interface DefineStoreOptionsBase<S extends StateTree, Store> {
    share?: { omit?: string[] };
  }
}

// oxlint-disable-next-line max-lines-per-function, max-statements
export const useAppStore = defineStore("app", () => {
  const stores: RegisterableStore[] = [];
  const globalComponents = ref<Map<string, Map<string, unknown>>>(new Map());
  const default_local_port = ref(globalThis.location.port);
  const status = ref(Status.NOT_CONNECTED);
  const protocol = computed(() => getRestApiProtocol());
  const port = computed(() => getRestApiPort(default_local_port.value));

  const base_url = computed(() => {
    const infraStore = useInfraStore();
    let app_url = `${protocol.value}://${infraStore.domain_name}:${port.value}`;
    if (isCloudMode()) {
      app_url += `/server`;
    }
    return app_url;
  });

  function registerGlobalComponent(
    extensionId: string,
    componentId: string,
    component: unknown,
  ): void {
    if (!globalComponents.value.has(extensionId)) {
      globalComponents.value.set(extensionId, new Map());
    }
    globalComponents.value.get(extensionId)?.set(componentId, component);
  }

  function unregisterGlobalComponent(extensionId: string, componentId: string): void {
    if (globalComponents.value.has(extensionId)) {
      globalComponents.value.get(extensionId)?.delete(componentId);
    }
  }

  function registerStore(store: RegisterableStore): void {
    const isAlreadyRegistered = stores.some(
      (registeredStore: RegisterableStore) => registeredStore.$id === store.$id,
    );
    if (isAlreadyRegistered) {
      return;
    }
    stores.push(store);
  }

  async function exportStores(
    params: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    const snapshot = await exportRegisteredStores(stores, params);
    return snapshot;
  }

  async function importStores(snapshot: Record<string, unknown> | undefined): Promise<void> {
    await importRegisteredStores(stores, snapshot);
  }

  const {
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
  } = useAppExtensions();

  const counter = useRequestCounter();
  const { request_counter, is_busy, start_request, stop_request } = counter;
  const transport = useHttpTransport("app", base_url, counter);
  const { request } = transport;

  async function upload(file: Readonly<File>, callbacks: RequestHandlers = {}): Promise<unknown> {
    const schema = opengeodeweb_front_schemas.api.local.extensions.upload;
    const { PROJECT: projectName } = useRuntimeConfig().public;
    const result = await transport.upload({ schema, file, params: { projectName } }, callbacks);
    return result;
  }

  const projectFolderPath = ref("");

  async function createProjectFolder(): Promise<unknown> {
    const { PROJECT } = useRuntimeConfig().public;
    const schema = opengeodeweb_front_schemas.api.local.app.project_folder_path;
    const params = { PROJECT };
    const result = await request(
      { schema, params },
      {
        response_function: (response) => {
          projectFolderPath.value = response.projectFolderPath;
        },
      },
    );
    return result;
  }

  return {
    stores,
    default_local_port,
    request_counter,
    status,
    protocol,
    port,
    base_url,
    is_busy,
    registerStore,
    exportStores,
    importStores,
    loadedExtensions,
    extensionAPI,
    setExtensionAPI,
    setCodeTransformer,
    loadExtension,
    getLoadedExtensions,
    getExtension,
    unloadExtension,
    toggleExtension,
    setExtensionEnabled,
    getExtensionEnabled,
    request,
    upload,
    projectFolderPath,
    createProjectFolder,
    start_request,
    stop_request,
    globalComponents,
    registerGlobalComponent,
    unregisterGlobalComponent,
  };
});

export type { RegisterableStore } from "./app_helpers/registry.js";
