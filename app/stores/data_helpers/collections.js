import { database } from "@ogw_internal/database/database.js";
import { liveQuery } from "dexie";
import { useDataMesh } from "./mesh.js";
import { useObservable } from "@vueuse/rxjs";

export function useDataCollections() {
  const model_components_db = database.model_components;
  const model_components_relation_db = database.model_components_relation;
  const { getAllMeshComponents } = useDataMesh();

  async function getAllCollectionComponents(modelId) {
    const items = await model_components_db.where("id").equals(modelId).toArray();
    return items.filter((component) => ['Horizon', 'Fault', 'FaultBlock', 'StratigraphicUnit', 'ModelBoundary'].includes(component.type)).map((component) => ({
      id: component.geode_id,
      title: component.name,
      category: component.type,
      viewer_id: Number(component.viewer_id),
      is_active: component.is_active,
    }));
  }

  async function fetchAllCollectionComponents(modelId) {
    const components = await getAllCollectionComponents(modelId);
    const relations = await model_components_relation_db.where("id").equals(modelId).toArray();
    const allMeshComponents = await getAllMeshComponents(modelId);
    const meshComponentsById = {};
    for (const meshComponent of allMeshComponents) {
      meshComponentsById[meshComponent.id] = meshComponent;
    }

    const byType = {};
    for (const component of components) {
      if (!byType[component.category]) {
        byType[component.category] = [];
      }
      const itemRelations = relations.filter(relation => relation.parent === component.id && relation.type === "collection");
      const children = itemRelations.map(relation => meshComponentsById[relation.child]).filter(Boolean);
      byType[component.category].push({
        ...component,
        children
      });
    }
    return byType;
  }

  async function formatedCollectionComponents(modelId) {
    const byType = await fetchAllCollectionComponents(modelId);
    const collectionTitles = {
      Horizon: "Horizons",
      Fault: "Faults",
      FaultBlock: "FaultBlocks",
      StratigraphicUnit: "StratigraphicUnits",
      ModelBoundary: "ModelBoundaries"
    };

    return Object.keys(collectionTitles)
      .filter((type) => byType[type] && byType[type].length > 0)
      .map((type) => ({
        id: type,
        title: collectionTitles[type],
        children: byType[type]
      }));
  }

  function refFormatedCollectionComponents(modelId) {
    return useObservable(
      liveQuery(() => formatedCollectionComponents(modelId)),
      { initialValue: undefined },
    );
  }

  return {
    getAllCollectionComponents,
    fetchAllCollectionComponents,
    formatedCollectionComponents,
    refFormatedCollectionComponents,
  };
}
