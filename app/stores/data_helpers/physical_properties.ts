import type { DataIdentified, ModelId } from "@ogw_front/types/identifiers";
import back_schemas, {
  type PhysicalProperty,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { Ref } from "vue";
import { getTable } from "@ogw_internal/database/database.js";
import { liveObservable } from "@ogw_front/utils/live_observable";
import { useBackStore } from "@ogw_front/stores/back";
import { useObservable } from "@vueuse/rxjs";

// One physical property of a model, as the back describes it
interface ModelPhysicalPropertyRecord extends DataIdentified, PhysicalProperty {}

// The back reports its errors itself: the model is then imported without physical properties
async function fetchPhysicalProperties(modelId: ModelId): Promise<PhysicalProperty[]> {
  try {
    const response = await useBackStore().request({
      schema: back_schemas.opengeodeweb_back.model_physical_properties,
      params: { id: modelId },
    });
    return response.physical_properties;
  } catch {
    return [];
  }
}

export function useDataPhysicalProperties(): {
  addPhysicalProperties: typeof addPhysicalProperties;
  getPhysicalProperties: typeof getPhysicalProperties;
  refPhysicalProperties: typeof refPhysicalProperties;
  deletePhysicalProperties: typeof deletePhysicalProperties;
  clearPhysicalProperties: typeof clearPhysicalProperties;
} {
  const model_physical_properties_db = getTable<ModelPhysicalPropertyRecord>(
    "model_physical_properties",
  );

  // Read from the back once per import: a model never changes once imported
  async function addPhysicalProperties(modelId: ModelId): Promise<void> {
    const physicalProperties = await fetchPhysicalProperties(modelId);
    const records = physicalProperties.map((physicalProperty) =>
      Object.assign(physicalProperty, { data_id: modelId }),
    );
    await model_physical_properties_db.bulkPut(records);
  }

  async function getPhysicalProperties(modelId: ModelId): Promise<ModelPhysicalPropertyRecord[]> {
    const records = await model_physical_properties_db.where("data_id").equals(modelId).toArray();
    return records;
  }

  function refPhysicalProperties(modelId: ModelId): Ref<ModelPhysicalPropertyRecord[] | undefined> {
    return useObservable(
      liveObservable(async () => {
        const records = await getPhysicalProperties(modelId);
        return records;
      }),
      { initialValue: undefined },
    );
  }

  async function deletePhysicalProperties(modelId: ModelId): Promise<void> {
    await model_physical_properties_db.where("data_id").equals(modelId).delete();
  }

  async function clearPhysicalProperties(): Promise<void> {
    await model_physical_properties_db.clear();
  }

  return {
    addPhysicalProperties,
    getPhysicalProperties,
    refPhysicalProperties,
    deletePhysicalProperties,
    clearPhysicalProperties,
  };
}

export type { ModelPhysicalPropertyRecord };
