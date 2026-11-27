import back_schemas, {
  type PhysicalProperty,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { ModelId } from "@ogw_front/types/identifiers";
import type { ModelPhysicalPropertyRecord } from "@ogw_internal/database/tables/model_physical_properties";
import type { Ref } from "vue";
import { liveObservable } from "@ogw_front/utils/live_observable";
import { modelPhysicalPropertiesDb } from "@ogw_internal/database/database.js";
import { modelPhysicalPropertiesOf } from "@ogw_internal/database/queries.js";
import { useBackStore } from "@ogw_front/stores/back";
import { useObservable } from "@vueuse/rxjs";

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

// Read from the back once per import: a model never changes once imported
async function addPhysicalProperties(modelId: ModelId): Promise<void> {
  const physicalProperties = await fetchPhysicalProperties(modelId);
  const records = physicalProperties.map((physicalProperty) =>
    Object.assign(physicalProperty, { data_id: modelId }),
  );
  await modelPhysicalPropertiesDb().bulkPut(records);
}

async function getPhysicalProperties(modelId: ModelId): Promise<ModelPhysicalPropertyRecord[]> {
  const records = await modelPhysicalPropertiesOf(modelId).toArray();
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

export { addPhysicalProperties, getPhysicalProperties, refPhysicalProperties };
export type { ModelPhysicalPropertyRecord } from "@ogw_internal/database/tables/model_physical_properties";
