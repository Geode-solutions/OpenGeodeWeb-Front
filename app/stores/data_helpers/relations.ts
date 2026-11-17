import type { DataIdentified, ModelId } from "@ogw_front/types/identifiers";
import {
  type FormattedComponent,
  type ModelComponentRecord,
  toFormattedComponent,
} from "./mesh.js";
import { Dexie } from "dexie";
import { getTable } from "@ogw_internal/database/database.js";

interface ComponentRelations {
  readonly boundaries: readonly FormattedComponent[];
  readonly internals: readonly FormattedComponent[];
}

interface ModelComponentRelationRecord extends DataIdentified {
  parent: string;
  child: string;
  type: string;
}

const RELATION_KEYS: Readonly<Record<string, keyof ComponentRelations>> = {
  boundary: "boundaries",
  internal: "internals",
};

type MutableComponentRelations = { [Key in keyof ComponentRelations]: FormattedComponent[] };

function groupRelationsByParent(
  relations: readonly ModelComponentRelationRecord[],
  components: readonly ModelComponentRecord[],
): Record<string, ComponentRelations> {
  const componentsById = new Map(
    components.map((component) => [component.geode_id, toFormattedComponent(component)]),
  );
  const byParent: Record<string, MutableComponentRelations> = {};
  for (const relation of relations) {
    const key = RELATION_KEYS[relation.type];
    const child = componentsById.get(relation.child);
    if (key !== undefined && child !== undefined) {
      byParent[relation.parent] ??= { boundaries: [], internals: [] };
      byParent[relation.parent]?.[key].push(child);
    }
  }
  return byParent;
}

export function useDataRelations(): {
  getComponentRelations: typeof getComponentRelations;
  fetchAllComponentRelations: typeof fetchAllComponentRelations;
} {
  const model_components_db = getTable<ModelComponentRecord>("model_components");
  const model_components_relation_db = getTable<ModelComponentRelationRecord>(
    "model_components_relation",
  );

  async function getRelatedComponents(
    modelId: ModelId,
    relations: readonly ModelComponentRelationRecord[],
    type: string,
  ): Promise<FormattedComponent[]> {
    const keys = relations
      .filter((relation) => relation.type === type)
      .map((relation) => [modelId, relation.child]);
    const components = await model_components_db.where("[data_id+geode_id]").anyOf(keys).toArray();
    return components.map((component) => toFormattedComponent(component));
  }

  async function getComponentRelations(
    modelId: ModelId,
    componentId: string,
  ): Promise<ComponentRelations> {
    const relations = await model_components_relation_db
      .where("[data_id+parent+child]")
      .between([modelId, componentId, Dexie.minKey], [modelId, componentId, Dexie.maxKey])
      .toArray();
    const [boundaries, internals] = await Promise.all([
      getRelatedComponents(modelId, relations, "boundary"),
      getRelatedComponents(modelId, relations, "internal"),
    ]);
    return { boundaries, internals };
  }

  // The boundaries and internals of every component of the model, read in two queries
  async function fetchAllComponentRelations(
    modelId: ModelId,
  ): Promise<Record<string, ComponentRelations>> {
    const [relations, components] = await Promise.all([
      model_components_relation_db.where("data_id").equals(modelId).toArray(),
      model_components_db.where("data_id").equals(modelId).toArray(),
    ]);
    return groupRelationsByParent(relations, components);
  }

  return { getComponentRelations, fetchAllComponentRelations };
}

export type { ComponentRelations, ModelComponentRelationRecord };
