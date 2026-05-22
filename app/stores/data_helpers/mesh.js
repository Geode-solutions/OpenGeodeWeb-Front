import { database } from "@ogw_internal/database/database.js";
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";

export function useDataMesh() {
  const model_components_db = database.model_components;

  async function formatedMeshComponents(modelId) {
    const items = await model_components_db.where("id").equals(modelId).toArray();
    const componentTitles = {
      Corner: "Corners",
      Line: "Lines",
      Surface: "Surfaces",
      Block: "Blocks",
    };

    const componentsByType = {};
    for (const component_item of items) {
      if (componentTitles[component_item.type]) {
        if (!componentsByType[component_item.type]) {
          componentsByType[component_item.type] = [];
        }
        componentsByType[component_item.type].push(component_item);
      }
    }

    return Object.keys(componentTitles)
      .filter((type) => componentsByType[type])
      .map((type) => ({
        id: type,
        title: componentTitles[type],
        children: componentsByType[type].map((meshComponent) => ({
          id: meshComponent.geode_id,
          title: meshComponent.name,
          category: meshComponent.type,
          viewer_id: Number(meshComponent.viewer_id),
          is_active: meshComponent.is_active,
        })),
      }));
  }

  function refFormatedMeshComponents(modelId) {
    return useObservable(
      liveQuery(() => formatedMeshComponents(modelId)),
      { initialValue: undefined },
    );
  }

  async function getMeshComponentsByType(modelId, type) {
    const components = await model_components_db
      .where("[id+type]")
      .equals([modelId, type])
      .toArray();
    return components.map((meshComponent) => ({
      id: meshComponent.geode_id,
      title: meshComponent.name,
      category: meshComponent.type,
      viewer_id: Number(meshComponent.viewer_id),
      is_active: meshComponent.is_active,
    }));
  }

  async function getAllMeshComponents(modelId) {
    const items = await model_components_db.where("id").equals(modelId).toArray();
    return items.map((meshComponent) => ({
      id: meshComponent.geode_id,
      title: meshComponent.name,
      category: meshComponent.type,
      viewer_id: Number(meshComponent.viewer_id),
      is_active: meshComponent.is_active,
    }));
  }

  async function fetchAllMeshComponents(modelId) {
    const components = await getAllMeshComponents(modelId);
    const byType = {};
    for (const component of components) {
      if (!byType[component.category]) {
        byType[component.category] = [];
      }
      byType[component.category].push(component);
    }
    return byType;
  }

  async function getMeshComponentGeodeIds(modelId, type) {
    const components = await model_components_db
      .where("[id+type]")
      .equals([modelId, type])
      .toArray();
    return components.map((component) => component.geode_id);
  }

  async function getCornersGeodeIds(modelId) {
    return await getMeshComponentGeodeIds(modelId, "Corner");
  }

  async function getLinesGeodeIds(modelId) {
    return await getMeshComponentGeodeIds(modelId, "Line");
  }

  async function getSurfacesGeodeIds(modelId) {
    return await getMeshComponentGeodeIds(modelId, "Surface");
  }

  async function getBlocksGeodeIds(modelId) {
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
