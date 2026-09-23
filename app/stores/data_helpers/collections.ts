import { type FormattedComponent, type ModelComponentRecord, useDataMesh } from "./mesh.js";
import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import type { Observable } from "rxjs";
import type { Ref } from "vue";
import { getTable } from "@ogw_internal/database/database.js";
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";

interface ModelComponentRelationRecord {
  id: string;
  parent: string;
  child: string;
  type: string;
}

interface CollectionComponent extends FormattedComponent {
  readonly children: readonly FormattedComponent[];
}

interface CollectionComponentGroup {
  id: string;
  title: string;
  readonly children: readonly CollectionComponent[];
}

function pluralize(type: string): string {
  if (type.endsWith("y")) {
    return `${type.slice(0, -1)}ies`;
  }
  return `${type}s`;
}

// oxlint-disable-next-line eslint/max-lines-per-function
export function useDataCollections(): {
  hasCollectionComponents: typeof hasCollectionComponents;
  getAllCollectionComponents: typeof getAllCollectionComponents;
  fetchAllCollectionComponents: typeof fetchAllCollectionComponents;
  formatedCollectionComponents: typeof formatedCollectionComponents;
  refFormatedCollectionComponents: typeof refFormatedCollectionComponents;
} {
  const model_components_db = getTable<ModelComponentRecord>("model_components");
  const model_components_relation_db = getTable<ModelComponentRelationRecord>(
    "model_components_relation",
  );
  const { getAllMeshComponents } = useDataMesh();

  async function hasCollectionComponents(modelId: string): Promise<boolean> {
    const count = await model_components_db
      .where("id")
      .equals(modelId)
      .and((component: ModelComponentRecord) => !MESH_COMPONENT_TYPES.includes(component.type))
      .count();
    return count > 0;
  }

  async function getAllCollectionComponents(modelId: string): Promise<FormattedComponent[]> {
    const items = await model_components_db.where("id").equals(modelId).toArray();
    return items
      .filter((component: ModelComponentRecord) => !MESH_COMPONENT_TYPES.includes(component.type))
      .map((component: ModelComponentRecord) => ({
        id: component.geode_id,
        title: component.name,
        category: component.type,
        viewer_id: Number(component.viewer_id),
        is_active: component.is_active,
      }));
  }

  async function fetchAllCollectionComponents(
    modelId: string,
  ): Promise<Record<string, CollectionComponent[]>> {
    const components = await getAllCollectionComponents(modelId);
    const relations = await model_components_relation_db.where("id").equals(modelId).toArray();
    const allMeshComponents = await getAllMeshComponents(modelId);
    const meshComponentsById: Record<string, FormattedComponent> = {};
    for (const meshComponent of allMeshComponents) {
      meshComponentsById[meshComponent.id] = meshComponent;
    }

    const byType: Record<string, CollectionComponent[]> = {};
    for (const component of components) {
      byType[component.category] ??= [];
      const itemRelations = relations.filter(
        (relation: ModelComponentRelationRecord) =>
          relation.parent === component.id && relation.type === "collection",
      );
      const children = itemRelations
        .map((relation: ModelComponentRelationRecord) => meshComponentsById[relation.child])
        .filter((child): child is FormattedComponent => Boolean(child));
      byType[component.category]?.push({
        ...component,
        children,
      });
    }
    return byType;
  }

  async function formatedCollectionComponents(
    modelId: string,
  ): Promise<CollectionComponentGroup[]> {
    const byType = await fetchAllCollectionComponents(modelId);
    const collectionTypes = Object.keys(byType);

    return collectionTypes
      .filter((type) => (byType[type]?.length ?? 0) > 0)
      .map((type) => ({
        id: type,
        title: pluralize(type),
        children: byType[type] ?? [],
      }));
  }

  function refFormatedCollectionComponents(
    modelId: string,
  ): Ref<CollectionComponentGroup[] | undefined> {
    return useObservable(
      // Dexie's liveQuery returns its own Observable-like type, not rxjs's Observable, so bridging needs a cast.
      liveQuery(async () => {
        const groups = await formatedCollectionComponents(modelId);
        return groups;
        // oxlint-disable-next-line no-unsafe-type-assertion
      }) as unknown as Observable<CollectionComponentGroup[]>,
      {
        initialValue: undefined,
      },
    );
  }

  return {
    hasCollectionComponents,
    getAllCollectionComponents,
    fetchAllCollectionComponents,
    formatedCollectionComponents,
    refFormatedCollectionComponents,
  };
}

export type { CollectionComponent, CollectionComponentGroup, ModelComponentRelationRecord };
