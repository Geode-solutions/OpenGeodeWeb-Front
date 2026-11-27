import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
import {
  modelComponent,
  modelComponentsByGeodeIds,
  modelComponentsOf,
} from "@ogw_internal/database/queries.js";
import { modelComponentsDb, modelComponentsRelationDb } from "@ogw_internal/database/database.js";
import type { ModelComponentInput } from "@ogw_internal/stores/data/model/types";
import type { ModelComponentRecord } from "@ogw_internal/database/tables/model_components";
import type { ModelComponentRelationRecord } from "@ogw_internal/database/tables/model_components_relation";
import type { NewDataItem } from "@ogw_internal/stores/data/types";

const modelComponentsTable = modelComponentsDb();
const modelComponentsRelationTable = modelComponentsRelationDb();

async function meshComponentType(
  modelId: ModelId,
  geodeId: ModelComponentId,
): Promise<string | undefined> {
  const component = await modelComponent(modelId, geodeId).first();
  return component?.type;
}

async function getAllModelComponentsViewerIds(modelId: ModelId): Promise<number[]> {
  const components = await modelComponentsOf(modelId).toArray();
  return components.map((component: ModelComponentRecord) =>
    Math.trunc(Number(component.viewer_id)),
  );
}

async function getMeshComponentsViewerIds(
  modelId: ModelId,
  meshComponentGeodeIds: readonly ModelComponentId[],
): Promise<number[]> {
  const components = await modelComponentsByGeodeIds(modelId, meshComponentGeodeIds).toArray();
  return components.map((component: ModelComponentRecord) =>
    Math.trunc(Number(component.viewer_id)),
  );
}

async function getComponentByViewerId(
  modelId: ModelId,
  viewerId: string | number,
): Promise<ModelComponentRecord | undefined> {
  const component = await modelComponentsTable
    .where("viewer_id")
    .equals(Number(viewerId))
    .and((candidate: ModelComponentRecord) => candidate.data_id === modelId)
    .first();
  return component;
}

async function getComponentsByViewerIds(
  modelId: ModelId,
  viewerIds: number[],
): Promise<ModelComponentRecord[]> {
  const components = await modelComponentsTable
    .where("viewer_id")
    .anyOf(viewerIds)
    .and((candidate: ModelComponentRecord) => candidate.data_id === modelId)
    .toArray();
  return components;
}

// NewDataItem has mutable array fields (mesh_components, collection_components), so it can't
// Satisfy prefer-readonly-parameter-types deeply; same pattern as app/utils/import_workflow.ts.
async function addComponents(newItem: NewDataItem): Promise<string> {
  const allComponents: ModelComponentRecord[] = [];
  // ModelComponentInput has mutable array fields (boundaries, internals, items), so a readonly
  // Array of it can't satisfy prefer-readonly-parameter-types deeply; same limitation as above.
  function addModelComponents(components: readonly ModelComponentInput[]): void {
    for (const component of components) {
      allComponents.push({
        data_id: newItem.data_id,
        geode_id: component.geode_id,
        type: component.type,
        viewer_id: component.viewer_id,
        name: component.name,
        is_active: component.is_active,
      });
    }
  }
  if (newItem.mesh_components) {
    addModelComponents(newItem.mesh_components);
  }
  if (newItem.collection_components) {
    addModelComponents(newItem.collection_components);
  }
  const lastKey = await modelComponentsTable.bulkPut(allComponents);
  return lastKey;
}

// NewDataItem has mutable array fields (mesh_components, collection_components), so it can't
// Satisfy prefer-readonly-parameter-types deeply; same pattern as app/utils/import_workflow.ts.
async function addComponentRelations(newItem: NewDataItem): Promise<string> {
  const relations: ModelComponentRelationRecord[] = [];
  function addModelComponentRelations(
    components: readonly ModelComponentId[],
    parent: ModelComponentId,
    type: string,
  ): void {
    for (const child of components) {
      relations.push({ data_id: newItem.data_id, parent, child, type });
    }
  }
  for (const component of newItem.mesh_components ?? []) {
    if (component.boundaries) {
      addModelComponentRelations(component.boundaries, component.geode_id, "boundary");
    }
    if (component.internals) {
      addModelComponentRelations(component.internals, component.geode_id, "internal");
    }
  }
  for (const component of newItem.collection_components ?? []) {
    if (component.items) {
      addModelComponentRelations(component.items, component.geode_id, "collection");
    }
  }
  const lastKey = await modelComponentsRelationTable.bulkPut(relations);
  return lastKey;
}

export {
  addComponentRelations,
  addComponents,
  getAllModelComponentsViewerIds,
  getComponentByViewerId,
  getComponentsByViewerIds,
  getMeshComponentsViewerIds,
  meshComponentType,
};
