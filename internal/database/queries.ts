import { type Collection, Dexie } from "dexie";
import { modelComponentsDb, modelComponentsRelationDb } from "./database";
import type { ModelComponentRecord } from "./tables/model_components";
import type { ModelComponentRelationRecord } from "./tables/model_components_relation";

type ModelComponents = Collection<ModelComponentRecord, string>;
type ModelComponentRelations = Collection<ModelComponentRelationRecord, string>;

function modelComponentsOf(modelId: string): ModelComponents {
  return modelComponentsDb().where("data_id").equals(modelId);
}

function modelComponentsOfType(modelId: string, type: string): ModelComponents {
  return modelComponentsDb().where("[data_id+type]").equals([modelId, type]);
}

function modelComponent(modelId: string, geodeId: string): ModelComponents {
  return modelComponentsDb().where("[data_id+geode_id]").equals([modelId, geodeId]);
}

function modelComponentsByGeodeIds(modelId: string, geodeIds: readonly string[]): ModelComponents {
  return modelComponentsDb()
    .where("[data_id+geode_id]")
    .anyOf(geodeIds.map((geodeId) => [modelId, geodeId]));
}

function modelComponentRelationsOf(modelId: string): ModelComponentRelations {
  return modelComponentsRelationDb().where("data_id").equals(modelId);
}

// The relations whose parent is the given component
function componentRelationsOf(modelId: string, parentId: string): ModelComponentRelations {
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
