import { type FormattedComponent, toFormattedComponent } from "./mesh_components.js";
import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
import {
  componentRelationsOf,
  modelComponentRelationsOf,
  modelComponentsByGeodeIds,
} from "@ogw_internal/database/queries.js";
import type { ModelComponentRelationRecord } from "@ogw_internal/database/tables/model_components_relation";

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
): Record<ModelComponentId, ComponentRelations> {
  const componentsById = new Map(components.map((component) => [component.id, component]));
  const byParent: Record<ModelComponentId, MutableComponentRelations> = {};
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

async function getRelatedComponents(
  modelId: ModelId,
  relations: readonly ModelComponentRelationRecord[],
  type: string,
): Promise<FormattedComponent[]> {
  const childIds = relations
    .filter((relation) => relation.type === type)
    .map((relation) => relation.child);
  const components = await modelComponentsByGeodeIds(modelId, childIds).toArray();
  return components.map((component) => toFormattedComponent(component));
}

async function getComponentRelations(
  modelId: ModelId,
  componentId: ModelComponentId,
): Promise<ComponentRelations> {
  const relations = await componentRelationsOf(modelId, componentId).toArray();
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
): Promise<Record<ModelComponentId, ComponentRelations>> {
  const relations = await modelComponentRelationsOf(modelId).toArray();
  return groupRelationsByParent(relations, components);
}

export type { ComponentRelations };
export type { ModelComponentRelationRecord } from "@ogw_internal/database/tables/model_components_relation";

export { fetchAllComponentRelations, getComponentRelations };
