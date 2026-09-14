// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import { liveQuery } from "dexie";
// oxlint-disable-next-line eslint/no-duplicate-imports
import type { Table } from "dexie";
import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import { database } from "@ogw_internal/database/database.js";
import { useDataMesh } from "./mesh.js";
// oxlint-disable-next-line eslint/no-duplicate-imports
import type { FormattedComponent, ModelComponentRecord } from "./mesh.js";
import { useObservable } from "@vueuse/rxjs";
import type { Observable } from "rxjs";

interface ModelComponentRelationRecord {
  id: string;
  parent: string;
  child: string;
  type: string;
}

interface CollectionComponent extends FormattedComponent {
  children: FormattedComponent[];
}

interface CollectionComponentGroup {
  id: string;
  title: string;
  children: CollectionComponent[];
}

function pluralize(type: string): string {
  if (type.endsWith("y")) {
    return `${type.slice(0, -1)}ies`;
  }
  return `${type}s`;
}

export function useDataCollections() {
  const model_components_db = database.model_components as unknown as Table<
    ModelComponentRecord,
    string
  >;
  const model_components_relation_db = database.model_components_relation as unknown as Table<
    ModelComponentRelationRecord,
    string
  >;
  const { getAllMeshComponents } = useDataMesh();

  async function hasCollectionComponents(modelId: string): Promise<boolean> {
    const count = await model_components_db
      .where("id")
      .equals(modelId)
      .and((component) => !MESH_COMPONENT_TYPES.includes(component.type))
      .count();
    return count > 0;
  }

  async function getAllCollectionComponents(modelId: string): Promise<FormattedComponent[]> {
    const items = await model_components_db.where("id").equals(modelId).toArray();
    return items
      .filter((component) => !MESH_COMPONENT_TYPES.includes(component.type))
      .map((component) => ({
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
      if (!byType[component.category]) {
        byType[component.category] = [];
      }
      const itemRelations = relations.filter(
        (relation) => relation.parent === component.id && relation.type === "collection",
      );
      const children = itemRelations
        .map((relation) => meshComponentsById[relation.child])
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
      .filter((type) => byType[type] && (byType[type]?.length ?? 0) > 0)
      .map((type) => ({
        id: type,
        title: pluralize(type),
        children: byType[type] ?? [],
      }));
  }

  function refFormatedCollectionComponents(modelId: string) {
    // Dexie's liveQuery() returns Dexie's own minimal Observable shape, not an
    // Actual rxjs Observable instance (useObservable's declared parameter type);
    // The two are structurally close enough at runtime (vueuse only calls
    // `.subscribe`) but not identical, hence the cast.
    return useObservable(
      liveQuery(() => formatedCollectionComponents(modelId)) as unknown as Observable<
        CollectionComponentGroup[]
      >,
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
