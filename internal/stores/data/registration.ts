import type { ComputedRef, Ref } from "vue";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { DataItem } from "@ogw_internal/database/tables/data";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const viewerGenericSchemas = viewer_schemas.opengeodeweb_viewer.generic;

// Ids the viewer holds a pipeline for: an item is stored before it is registered, and non viewable items never are
function useDataRegistration(items: Readonly<Ref<DataItem[]>>): {
  registeredItems: ComputedRef<DataItem[]>;
  isRegistered: typeof isRegistered;
  registerObject: typeof registerObject;
  deregisterObject: typeof deregisterObject;
  clearRegistrations: typeof clearRegistrations;
} {
  const viewerStore = useViewerStore();
  const registeredIds = reactive(new Set<DataId>());

  function isRegistered(dataId: DataId): boolean {
    return registeredIds.has(dataId);
  }

  const registeredItems = computed(() =>
    items.value.filter((dataItem) => isRegistered(dataItem.data_id)),
  );

  async function registerObject(dataId: DataId, name: string): Promise<unknown> {
    const result = await viewerStore.request({
      schema: viewerGenericSchemas.register,
      params: { id: dataId, name },
      timeout: 0,
    });
    registeredIds.add(dataId);
    return result;
  }

  async function deregisterObject(dataId: DataId): Promise<unknown> {
    registeredIds.delete(dataId);
    const result = await viewerStore.request({
      schema: viewerGenericSchemas.deregister,
      params: { id: dataId },
    });
    return result;
  }

  function clearRegistrations(): void {
    registeredIds.clear();
  }

  return { registeredItems, isRegistered, registerObject, deregisterObject, clearRegistrations };
}

export { useDataRegistration };
