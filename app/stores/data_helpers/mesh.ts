import type { Table } from "dexie";
import { database } from "@ogw_internal/database/database.js";
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";
import type { Observable } from "rxjs";

interface ModelComponentRecord {
  id: string;
  geode_id: string;
  type: string;
  viewer_id: string | number;
  name: string;
  is_active: boolean;
}

interface FormattedComponent {
  id: string;
  title: string;
  category: string;
  viewer_id: number;
  is_active: boolean;
}

interface FormattedComponentGroup {
  id: string;
  title: string;
  children: FormattedComponent[];
}

function toFormattedComponent(meshComponent: ModelComponentRecord): FormattedComponent {
  return {
    id: meshComponent.geode_id,
    title: meshComponent.name,
    category: meshComponent.type,
    viewer_id: Math.trunc(Number(meshComponent.viewer_id)),
    is_active: meshComponent.is_active,
  };
}

export function useDataMesh() {
  const model_components_db = database.model_components as unknown as Table<
    ModelComponentRecord,
    string
  >;

  async function formatedMeshComponents(modelId: string): Promise<FormattedComponentGroup[]> {
    const items = await model_components_db.where("id").equals(modelId).toArray();
    const componentTitles: Record<string, string> = {
      Corner: "Corners",
      Line: "Lines",
      Surface: "Surfaces",
      Block: "Blocks",
    };

    const componentsByType: Record<string, ModelComponentRecord[]> = {};
    for (const component_item of items) {
      if (componentTitles[component_item.type]) {
        if (!componentsByType[component_item.type]) {
          componentsByType[component_item.type] = [];
        }
        componentsByType[component_item.type]?.push(component_item);
      }
    }

    return Object.keys(componentTitles)
      .filter((type) => componentsByType[type])
      .map((type) => ({
        id: type,
        title: componentTitles[type] ?? type,
        children: (componentsByType[type] ?? []).map(toFormattedComponent),
      }));
  }

  function refFormatedMeshComponents(modelId: string) {
    // Dexie's liveQuery() returns Dexie's own minimal Observable shape, not an
    // Actual rxjs Observable instance (useObservable's declared parameter type);
    // The two are structurally close enough at runtime (vueuse only calls
    // `.subscribe`) but not identical, hence the cast.
    return useObservable(
      liveQuery(() => formatedMeshComponents(modelId)) as unknown as Observable<
        FormattedComponentGroup[]
      >,
      {
        initialValue: undefined,
      },
    );
  }

  async function getMeshComponentsByType(
    modelId: string,
    type: string,
  ): Promise<FormattedComponent[]> {
    const components = await model_components_db
      .where("[id+type]")
      .equals([modelId, type])
      .toArray();
    return components.map(toFormattedComponent);
  }

  async function getAllMeshComponents(modelId: string): Promise<FormattedComponent[]> {
    const items = await model_components_db.where("id").equals(modelId).toArray();
    return items.map(toFormattedComponent);
  }

  async function fetchAllMeshComponents(
    modelId: string,
  ): Promise<Record<string, FormattedComponent[]>> {
    const components = await getAllMeshComponents(modelId);
    const byType: Record<string, FormattedComponent[]> = {};
    for (const component of components) {
      if (!byType[component.category]) {
        byType[component.category] = [];
      }
      byType[component.category]?.push(component);
    }
    return byType;
  }

  async function getMeshComponentGeodeIds(modelId: string, type: string): Promise<string[]> {
    const components = await model_components_db
      .where("[id+type]")
      .equals([modelId, type])
      .toArray();
    return components.map((component) => component.geode_id);
  }

  async function getCornersGeodeIds(modelId: string): Promise<string[]> {
    return await getMeshComponentGeodeIds(modelId, "Corner");
  }

  async function getLinesGeodeIds(modelId: string): Promise<string[]> {
    return await getMeshComponentGeodeIds(modelId, "Line");
  }

  async function getSurfacesGeodeIds(modelId: string): Promise<string[]> {
    return await getMeshComponentGeodeIds(modelId, "Surface");
  }

  async function getBlocksGeodeIds(modelId: string): Promise<string[]> {
    return await getMeshComponentGeodeIds(modelId, "Block");
  }

  return {
    formatedMeshComponents,
    refFormatedMeshComponents,
    getMeshComponentsByType,
    getAllMeshComponents,
    fetchAllMeshComponents,
    getMeshComponentGeodeIds,
    getCornersGeodeIds,
    getLinesGeodeIds,
    getSurfacesGeodeIds,
    getBlocksGeodeIds,
  };
}

export type { ModelComponentRecord, FormattedComponent, FormattedComponentGroup };
