import { type Table, liveQuery } from "dexie";
import type { Observable } from "rxjs";
import { database } from "@ogw_internal/database/database.js";
import { useObservable } from "@vueuse/rxjs";

interface ModelComponentRecord {
  id: string;
  geode_id: string;
  type: string;
  viewer_id: string | number;
  name: string;
  is_active: boolean;
}

interface FormattedComponent {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly viewer_id: number;
  readonly is_active: boolean;
}

interface FormattedComponentGroup {
  id: string;
  title: string;
  readonly children: readonly FormattedComponent[];
}

function toFormattedComponent(meshComponent: Readonly<ModelComponentRecord>): FormattedComponent {
  return {
    id: meshComponent.geode_id,
    title: meshComponent.name,
    category: meshComponent.type,
    viewer_id: Math.trunc(Number(meshComponent.viewer_id)),
    is_active: meshComponent.is_active,
  };
}

// oxlint-disable-next-line eslint/max-lines-per-function
export function useDataMesh(): {
  formatedMeshComponents: typeof formatedMeshComponents;
  refFormatedMeshComponents: typeof refFormatedMeshComponents;
  getMeshComponentsByType: typeof getMeshComponentsByType;
  getAllMeshComponents: typeof getAllMeshComponents;
  fetchAllMeshComponents: typeof fetchAllMeshComponents;
  getMeshComponentGeodeIds: typeof getMeshComponentGeodeIds;
  getCornersGeodeIds: typeof getCornersGeodeIds;
  getLinesGeodeIds: typeof getLinesGeodeIds;
  getSurfacesGeodeIds: typeof getSurfacesGeodeIds;
  getBlocksGeodeIds: typeof getBlocksGeodeIds;
} {
  // oxlint-disable-next-line no-unsafe-type-assertion -- database's table map is dynamically typed at runtime.
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
      if (componentTitles[component_item.type] !== undefined) {
        componentsByType[component_item.type] ??= [];
        componentsByType[component_item.type]?.push(component_item);
      }
    }

    return Object.keys(componentTitles)
      .filter((type) => componentsByType[type])
      .map((type) => ({
        id: type,
        title: componentTitles[type] ?? type,
        children: (componentsByType[type] ?? []).map((item: Readonly<ModelComponentRecord>) =>
          toFormattedComponent(item),
        ),
      }));
  }

  function refFormatedMeshComponents(
    modelId: string,
  ): Readonly<Ref<FormattedComponentGroup[] | undefined>> {
    return useObservable(
      // oxlint-disable-next-line no-unsafe-type-assertion
      liveQuery(async () => {
        const components = await formatedMeshComponents(modelId);
        return components;
      }) as unknown as Observable<FormattedComponentGroup[]>,
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
    return components.map((item: Readonly<ModelComponentRecord>) => toFormattedComponent(item));
  }

  async function getAllMeshComponents(modelId: string): Promise<FormattedComponent[]> {
    const items = await model_components_db.where("id").equals(modelId).toArray();
    return items.map((item: Readonly<ModelComponentRecord>) => toFormattedComponent(item));
  }

  async function fetchAllMeshComponents(
    modelId: string,
  ): Promise<Record<string, FormattedComponent[]>> {
    const components = await getAllMeshComponents(modelId);
    const byType: Record<string, FormattedComponent[]> = {};
    for (const component of components) {
      byType[component.category] ??= [];
      byType[component.category]?.push(component);
    }
    return byType;
  }

  async function getMeshComponentGeodeIds(modelId: string, type: string): Promise<string[]> {
    const components = await model_components_db
      .where("[id+type]")
      .equals([modelId, type])
      .toArray();
    return components.map((component: Readonly<ModelComponentRecord>) => component.geode_id);
  }

  async function getCornersGeodeIds(modelId: string): Promise<string[]> {
    const geodeIds = await getMeshComponentGeodeIds(modelId, "Corner");
    return geodeIds;
  }

  async function getLinesGeodeIds(modelId: string): Promise<string[]> {
    const geodeIds = await getMeshComponentGeodeIds(modelId, "Line");
    return geodeIds;
  }

  async function getSurfacesGeodeIds(modelId: string): Promise<string[]> {
    const geodeIds = await getMeshComponentGeodeIds(modelId, "Surface");
    return geodeIds;
  }

  async function getBlocksGeodeIds(modelId: string): Promise<string[]> {
    const geodeIds = await getMeshComponentGeodeIds(modelId, "Block");
    return geodeIds;
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
