import back_schemas, {
  type PhysicalProperty,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { ModelId } from "@ogw_front/types/identifiers";
import type { ModelPhysicalPropertyRecord } from "@ogw_internal/database/tables/model_physical_properties";
import type { Ref } from "vue";
import { consola } from "consola";
import { liveObservable } from "@ogw_front/utils/live_observable";
import { modelPhysicalPropertiesDb } from "@ogw_internal/database/database.js";
import { modelPhysicalPropertiesOf } from "@ogw_internal/database/queries.js";
import { useBackStore } from "@ogw_front/stores/back";
import { useObservable } from "@vueuse/rxjs";

// A failed request leaves the model without physical properties, and does not stop its import.
// It is expected for a model another microservice has just created (e.g. by Vease-Modeling): its
// Native file may still be written when the model is imported. So no error is shown to the user,
// The console keeps it
async function fetchPhysicalProperties(modelId: ModelId): Promise<PhysicalProperty[]> {
  try {
    const response = await useBackStore().request(
      {
        schema: back_schemas.opengeodeweb_back.model_physical_properties,
        params: { id: modelId },
      },
      { skip_feedback_error: true },
    );
    return response.physical_properties;
  } catch (error) {
    consola.warn(`Could not read the physical properties of model ${modelId}:`, error);
    return [];
  }
}

// Read from the back once per import: a model never changes once imported
async function addPhysicalProperties(modelId: ModelId): Promise<void> {
  const records: ModelPhysicalPropertyRecord[] = [];
  for (const physicalProperty of await fetchPhysicalProperties(modelId)) {
    records.push({ ...physicalProperty, data_id: modelId });
  }
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
