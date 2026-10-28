import {
  type FormattedComponent,
  type ModelComponentRecord,
  toFormattedComponent,
} from "./mesh.js";
import { Dexie } from "dexie";
import { getTable } from "@ogw_internal/database/database.js";

interface ModelComponentRelationRecord {
  id: string;
  parent: string;
  child: string;
  type: string;
}

interface ComponentRelations {
  readonly boundaries: readonly FormattedComponent[];
  readonly internals: readonly FormattedComponent[];
}

export function useDataRelations(): {
  getComponentRelations: typeof getComponentRelations;
} {
  const model_components_db = getTable<ModelComponentRecord>("model_components");
  const model_components_relation_db = getTable<ModelComponentRelationRecord>(
    "model_components_relation",
  );

  async function getRelatedComponents(
    modelId: string,
    relations: readonly ModelComponentRelationRecord[],
    type: string,
  ): Promise<FormattedComponent[]> {
    const keys = relations
      .filter((relation) => relation.type === type)
      .map((relation) => [modelId, relation.child]);
    const components = await model_components_db.where("[id+geode_id]").anyOf(keys).toArray();
    return components.map((component) => toFormattedComponent(component));
  }

  async function getComponentRelations(
    modelId: string,
    componentId: string,
  ): Promise<ComponentRelations> {
    const relations = await model_components_relation_db
      .where("[id+parent+child]")
      .between([modelId, componentId, Dexie.minKey], [modelId, componentId, Dexie.maxKey])
      .toArray();
    const [boundaries, internals] = await Promise.all([
      getRelatedComponents(modelId, relations, "boundary"),
      getRelatedComponents(modelId, relations, "internal"),
    ]);
    return { boundaries, internals };
  }

  return { getComponentRelations };
}

export type { ComponentRelations };
