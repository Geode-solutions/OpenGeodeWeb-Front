import { type Collection, Dexie } from "dexie";
import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
import { modelComponentsDb, modelComponentsRelationDb } from "./database";
import type { ModelComponentRecord } from "./tables/model_components";
import type { ModelComponentRelationRecord } from "./tables/model_components_relation";

type ModelComponents = Collection<ModelComponentRecord, string>;
type ModelComponentRelations = Collection<ModelComponentRelationRecord, string>;

function modelComponentsOf(modelId: ModelId): ModelComponents {
  return modelComponentsDb().where("data_id").equals(modelId);
}

function modelComponentsOfType(modelId: ModelId, type: string): ModelComponents {
  return modelComponentsDb().where("[data_id+type]").equals([modelId, type]);
}

function modelComponent(modelId: ModelId, geodeId: ModelComponentId): ModelComponents {
  return modelComponentsDb().where("[data_id+geode_id]").equals([modelId, geodeId]);
}

function modelComponentsByGeodeIds(
  modelId: ModelId,
  geodeIds: readonly ModelComponentId[],
): ModelComponents {
  return modelComponentsDb()
    .where("[data_id+geode_id]")
    .anyOf(geodeIds.map((geodeId) => [modelId, geodeId]));
}

function modelComponentRelationsOf(modelId: ModelId): ModelComponentRelations {
  return modelComponentsRelationDb().where("data_id").equals(modelId);
}

// The relations whose parent is the given component
function componentRelationsOf(
  modelId: ModelId,
  parentId: ModelComponentId,
): ModelComponentRelations {
  return modelComponentsRelationDb()
    .where("[data_id+parent+child]")
    .between([modelId, parentId, Dexie.minKey], [modelId, parentId, Dexie.maxKey]);
}

export {
  componentRelationsOf,
  modelComponent,
  modelComponentRelationsOf,
  modelComponentsByGeodeIds,
  modelComponentsOf,
  modelComponentsOfType,
};
