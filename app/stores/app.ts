// Local imports
import { getRestApiPort, getRestApiProtocol, isCloudMode } from "@ogw_front/utils/stores.js";
import { Status } from "@ogw_front/utils/status";
import { api_fetch } from "@ogw_internal/utils/api_fetch.js";
import { upload_file } from "@ogw_internal/utils/upload_file.js";
import { useAppExtensions } from "./app_helpers/extension.js";
import { useInfraStore } from "@ogw_front/stores/infra";

import type { JsonRpcSchema, RequestHandlers } from "@ogw_shared/utils/types.js";
import type { StateTree } from "pinia";

import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_schemas.json" with { type: "json" };

// The `share` defineStore option (used by every store in this codebase) is implemented by a runtime pinia plugin outside this package's type surface; this augmentation only teaches the type checker about the option shape already used at each defineStore call site.
declare module "pinia" {
  // TypeScript requires a merged interface declaration's type parameter names to match pinia's own (`S`, `Store`) exactly, not just their count.
  // oxlint-disable-next-line eslint/id-length
  interface DefineStoreOptionsBase<S extends StateTree, Store> {
    share?: { omit?: string[] };
  }
}

interface RegisterableStore {
  $id: string;
  $patch?: (partial: Readonly<Record<string, unknown>>) => void;
  exportStores?: (params?: Readonly<Record<string, unknown>>) => Promise<unknown>;
  importStores?: (snapshot: unknown) => Promise<void> | void;
  connect?: () => Promise<void>;
  kill?: () => Promise<void>;
  [key: string]: unknown;
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

  function registerStore(store: Readonly<RegisterableStore>): void {
    const isAlreadyRegistered = stores.some(
      (registeredStore: Readonly<RegisterableStore>) => registeredStore.$id === store.$id,
    );
    if (isAlreadyRegistered) {
      return;
    }
    stores.push(store);
  }

  async function exportStores(
    params: Readonly<Record<string, unknown>> = {},
  ): Promise<Record<string, unknown>> {
    const snapshot: Record<string, unknown> = {};

    await Promise.all(
      stores.map(async (store: Readonly<RegisterableStore>) => {
        if (!store.exportStores) {
          return;
        }
        const storeId = store.$id;
        try {
          snapshot[storeId] = await store.exportStores(params);
        } catch {
          // Ignore stores that fail to export; other stores still complete independently.
        }
      }),
    );
    return snapshot;
  }

  async function importStores(
    snapshot: Readonly<Record<string, unknown>> | undefined,
  ): Promise<void> {
    if (!snapshot) {
      return;
    }

    const missingStoreIds: string[] = [];

    await Promise.all(
      stores.map(async (store: Readonly<RegisterableStore>) => {
        if (!store.importStores) {
          return;
        }
        const storeId = store.$id;
        if (snapshot[storeId] === undefined) {
          missingStoreIds.push(storeId);
          return;
        }
        try {
          await store.importStores(snapshot[storeId]);
        } catch {
          // Ignore stores that fail to import; other stores still complete independently.
        }
      }),
    );

    if (missingStoreIds.length > 0) {
      console.warn(`Stores not found in snapshot: ${missingStoreIds.join(", ")}`);
    }
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
  const request_counter = ref(0);
  function start_request(): void {
    request_counter.value += 1;
  }
  function stop_request(): void {
    request_counter.value -= 1;
  }
  const is_busy = computed(() => request_counter.value > 0);

  async function upload(file: Readonly<File>, callbacks: RequestHandlers = {}): Promise<unknown> {
    const microservice = { $id: "app", base_url: base_url.value, start_request, stop_request };
    const schema = opengeodeweb_front_schemas.api.local.extensions.upload;
    const { PROJECT: projectName } = useRuntimeConfig().public;
    const params = { projectName };
    const result = await upload_file(
      microservice,
      { schema, file, params },
      {
        ...callbacks,
        response_function: async (response: unknown) => {
          if (callbacks.response_function) {
            await callbacks.response_function(response);
          }
        },
      },
    );
    return result;
  }

  // `TResult` is asserted, not verified, at the single `return result as TResult` boundary below: the backend response is only checked against `schema` at runtime, so callers' `TResult` is a contract with the schema, not something this function can prove.
  async function request<TResult = unknown>(
    {
      schema,
      params,
    }: Readonly<{ schema: JsonRpcSchema; params?: Readonly<Record<string, unknown>> }>,
    callbacks: RequestHandlers = {},
  ): Promise<TResult> {
    const microservice = { $id: "app", base_url: base_url.value, start_request, stop_request };
    const result = await api_fetch(
      microservice,
      // The app store is only ever used with HTTP ("front") schemas, which always carry `methods`; the wider JsonRpcSchema param above is kept as-is to match this action's public signature (e.g. relayed from get_version-style callers that only know about the shared, looser schema shape).
      // oxlint-disable-next-line no-unsafe-type-assertion -- narrowing optional `methods` to required is safe here; see comment above.
      { schema: schema as JsonRpcSchema & { methods: string[] }, params },
      {
        ...callbacks,
        response_function: async (response: unknown) => {
          if (callbacks.response_function) {
            await callbacks.response_function(response);
          }
        },
      },
    );
    // oxlint-disable-next-line no-unsafe-type-assertion -- this is the trusted API boundary; see comment above.
    return result as TResult;
  }

  const projectFolderPath = ref("");

  async function createProjectFolder(): Promise<unknown> {
    const { PROJECT } = useRuntimeConfig().public;
    const schema = opengeodeweb_front_schemas.api.local.app.project_folder_path;
    const params = { PROJECT };
    const result = await request(
      { schema, params },
      {
        response_function: (response: unknown) => {
          // oxlint-disable-next-line no-unsafe-type-assertion
          const { projectFolderPath: newProjectFolderPath } = response as {
            projectFolderPath: string;
          };
          projectFolderPath.value = newProjectFolderPath;
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

export type { RegisterableStore };
