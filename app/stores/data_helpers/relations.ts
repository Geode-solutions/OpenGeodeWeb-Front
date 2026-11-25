import { type FormattedComponent, toFormattedComponent } from "./mesh.js";
import { modelComponentsDb, modelComponentsRelationDb } from "@ogw_internal/database/database.js";
import { Dexie } from "dexie";
import type { ModelComponentRelationRecord } from "@ogw_internal/database/tables/model_components_relation";
import type { ModelId } from "@ogw_front/types/identifiers";

interface ComponentRelations {
  readonly boundaries: readonly FormattedComponent[];
  readonly internals: readonly FormattedComponent[];
}

const RELATION_KEYS: Readonly<Record<string, keyof ComponentRelations>> = {
  boundary: "boundaries",
  internal: "internals",
};

type MutableComponentRelations = { [Key in keyof ComponentRelations]: FormattedComponent[] };

function groupRelationsByParent(
  relations: readonly ModelComponentRelationRecord[],
  components: readonly FormattedComponent[],
): Record<string, ComponentRelations> {
  const componentsById = new Map(components.map((component) => [component.id, component]));
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
  const modelComponentsTable = modelComponentsDb();
  const modelComponentsRelationTable = modelComponentsRelationDb();

  async function getRelatedComponents(
    modelId: ModelId,
    relations: readonly ModelComponentRelationRecord[],
    type: string,
  ): Promise<FormattedComponent[]> {
    const keys = relations
      .filter((relation) => relation.type === type)
      .map((relation) => [modelId, relation.child]);
    const components = await modelComponentsTable.where("[data_id+geode_id]").anyOf(keys).toArray();
    return components.map((component) => toFormattedComponent(component));
  }

  async function getComponentRelations(
    modelId: ModelId,
    componentId: string,
  ): Promise<ComponentRelations> {
    const relations = await modelComponentsRelationTable
      .where("[data_id+parent+child]")
      .between([modelId, componentId, Dexie.minKey], [modelId, componentId, Dexie.maxKey])
      .toArray();
    const [boundaries, internals] = await Promise.all([
      getRelatedComponents(modelId, relations, "boundary"),
      getRelatedComponents(modelId, relations, "internal"),
    ]);
    return { boundaries, internals };
  }

  // The boundaries and internals of every component of the model, among the given components:
  // The caller already holds them, so only the relations are read
  async function fetchAllComponentRelations(
    modelId: ModelId,
    components: readonly FormattedComponent[],
  ): Promise<Record<string, ComponentRelations>> {
    const relations = await modelComponentsRelationTable.where("data_id").equals(modelId).toArray();
    return groupRelationsByParent(relations, components);
  }

  return { getComponentRelations, fetchAllComponentRelations };
}

export type { ComponentRelations };
export type { ModelComponentRelationRecord } from "@ogw_internal/database/tables/model_components_relation";
