import type {
  BlockId,
  CornerId,
  GeodeIdentified,
  LineId,
  ModelComponentId,
  ModelId,
  SurfaceId,
} from "@ogw_front/types/identifiers";
import { modelComponentsOf, modelComponentsOfType } from "@ogw_internal/database/queries.js";
import type { ModelComponentRecord } from "@ogw_internal/database/tables/model_components";
import type { ModelComponentType } from "@ogw_front/types/model";
import type { ReadonlyTreeGroup } from "@ogw_front/types/tree";
import type { Title } from "@ogw_front/types/ui";
import type { ViewerId } from "@geode/opengeodeweb-viewer/schema_types";
import { liveObservable } from "@ogw_front/utils/live_observable";
import { useObservable } from "@vueuse/rxjs";

interface FormattedComponent extends Readonly<GeodeIdentified> {
  readonly id: ModelComponentId;
  readonly title: Title;
  readonly category: ModelComponentType;
  readonly viewer_id: ViewerId;
  readonly is_active: boolean;
}

type FormattedComponentGroup = ReadonlyTreeGroup<FormattedComponent>;

function toFormattedComponent(meshComponent: ModelComponentRecord): FormattedComponent {
  return {
    id: meshComponent.geode_id,
    geode_id: meshComponent.geode_id,
    title: meshComponent.name,
    category: meshComponent.type,
    viewer_id: Math.trunc(Number(meshComponent.viewer_id)),
    is_active: meshComponent.is_active,
  };
}

async function getMeshComponentGeodeIds(
  modelId: ModelId,
  type: ModelComponentType,
): Promise<ModelComponentId[]> {
  const components = await modelComponentsOfType(modelId, type).toArray();
  return components.map((component: ModelComponentRecord) => component.geode_id);
}

async function formatedMeshComponents(modelId: ModelId): Promise<FormattedComponentGroup[]> {
  const items = await modelComponentsOf(modelId).toArray();
  const componentTitles: Record<ModelComponentType, Title> = {
    Corner: "Corners",
    Line: "Lines",
    Surface: "Surfaces",
    Block: "Blocks",
  };

  const componentsByType: Record<ModelComponentType, ModelComponentRecord[]> = {};
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
      children: (componentsByType[type] ?? []).map((item: ModelComponentRecord) =>
        toFormattedComponent(item),
      ),
    }));
}

function refFormatedMeshComponents(modelId: ModelId): Ref<FormattedComponentGroup[] | undefined> {
  return useObservable(
    liveObservable(async () => {
      const components = await formatedMeshComponents(modelId);
      return components;
    }),
    {
      initialValue: undefined,
    },
  );
}

async function getMeshComponentsByType(
  modelId: ModelId,
  type: ModelComponentType,
): Promise<FormattedComponent[]> {
  const components = await modelComponentsOfType(modelId, type).toArray();
  return components.map((item: ModelComponentRecord) => toFormattedComponent(item));
}

async function getAllMeshComponents(modelId: ModelId): Promise<FormattedComponent[]> {
  const items = await modelComponentsOf(modelId).toArray();
  return items.map((item: ModelComponentRecord) => toFormattedComponent(item));
}

async function fetchAllMeshComponents(
  modelId: ModelId,
): Promise<Record<ModelComponentType, FormattedComponent[]>> {
  const components = await getAllMeshComponents(modelId);
  const byType: Record<ModelComponentType, FormattedComponent[]> = {};
  for (const component of components) {
    byType[component.category] ??= [];
    byType[component.category]?.push(component);
  }
  return byType;
}

async function getCornersGeodeIds(modelId: ModelId): Promise<CornerId[]> {
  const geodeIds = await getMeshComponentGeodeIds(modelId, "Corner");
  return geodeIds;
}

async function getLinesGeodeIds(modelId: ModelId): Promise<LineId[]> {
  const geodeIds = await getMeshComponentGeodeIds(modelId, "Line");
  return geodeIds;
}

async function getSurfacesGeodeIds(modelId: ModelId): Promise<SurfaceId[]> {
  const geodeIds = await getMeshComponentGeodeIds(modelId, "Surface");
  return geodeIds;
}

async function getBlocksGeodeIds(modelId: ModelId): Promise<BlockId[]> {
  const geodeIds = await getMeshComponentGeodeIds(modelId, "Block");
  return geodeIds;
}

export {
  fetchAllMeshComponents,
  formatedMeshComponents,
  getAllMeshComponents,
  getBlocksGeodeIds,
  getCornersGeodeIds,
  getLinesGeodeIds,
  getMeshComponentGeodeIds,
  getMeshComponentsByType,
  getSurfacesGeodeIds,
  refFormatedMeshComponents,
  toFormattedComponent,
};
export type { FormattedComponent, FormattedComponentGroup };
export type { ModelComponentRecord } from "@ogw_internal/database/tables/model_components";
