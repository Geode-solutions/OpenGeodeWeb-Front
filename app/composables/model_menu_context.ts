import { type ComputedRef, type Ref, computed, ref, watch } from "vue";
import { type MenuViewerObjectType, useMenuStore } from "@ogw_front/stores/menu";
import type { ModelId, ModelIdentified } from "@ogw_front/types/identifiers";
import type { CollectionComponent } from "@ogw_internal/stores/data/model/collections";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import { useDataStore } from "@ogw_front/stores/data";

interface ModelMenuMetaData extends Partial<ModelIdentified> {
  viewer_object_type?: MenuViewerObjectType;
  pickedComponentId?: string;
  modelComponentType?: string;
  targetComponentIds?: string[];
}

interface ModelMenuContext {
  modelId: ComputedRef<ModelId>;
  componentId: ComputedRef<string | undefined>;
  componentType: Ref<string | undefined>;
  collections: Ref<CollectionComponent[] | undefined>;
  targetComponentIds: Ref<string[]>;
}

// Resolves what a model context menu targets: the whole model, a component type, a collection or one component
// oxlint-disable-next-line max-lines-per-function
function useModelMenuContext(getDataId: () => DataId): ModelMenuContext {
  const dataStore = useDataStore();
  const menuStore = useMenuStore();
  // oxlint-disable-next-line no-unsafe-type-assertion -- meta_data is filled by the viewer context menu with these keys.
  const metaData = computed(() => menuStore.current_meta_data as ModelMenuMetaData);

  const modelId = computed<string>(() => metaData.value.modelId ?? getDataId());
  const componentId = computed<string | undefined>(() => metaData.value.pickedComponentId);
  const componentType = ref<string | undefined>(undefined);
  const collections = ref<CollectionComponent[] | undefined>(undefined);

  // A function so the check after an await is not narrowed by the one before it
  function isComponentTypeMenu(): boolean {
    return metaData.value.viewer_object_type === "model_component_type";
  }

  watch(
    () => [
      modelId.value,
      componentId.value,
      metaData.value.viewer_object_type,
      metaData.value.modelComponentType,
    ],
    async () => {
      componentType.value = undefined;
      collections.value = undefined;
      if (isComponentTypeMenu()) {
        const { modelComponentType = "", targetComponentIds: ids = [] } = metaData.value;
        if (MESH_COMPONENT_TYPES.includes(modelComponentType)) {
          componentType.value = modelComponentType;
        } else {
          const collectionsByType = await dataStore.fetchAllCollectionComponents(modelId.value);
          collections.value = (collectionsByType[modelComponentType] ?? []).filter((collection) =>
            collection.children.every((child) => ids.includes(child.id)),
          );
          componentType.value = collections.value[0]?.children[0]?.category;
        }
      } else if (componentId.value !== undefined && modelId.value !== "") {
        const currentModelId = modelId.value;
        const currentCompId = componentId.value;
        const type = await dataStore.meshComponentType(currentModelId, currentCompId);
        if (
          modelId.value === currentModelId &&
          componentId.value === currentCompId &&
          !isComponentTypeMenu()
        ) {
          componentType.value = type;
        }
      }
    },
    { immediate: true },
  );

  const targetComponentIds = ref<string[]>([]);
  watch(
    () => [modelId.value, componentType.value, metaData.value.targetComponentIds],
    async () => {
      targetComponentIds.value = [];
      if (metaData.value.targetComponentIds !== undefined) {
        targetComponentIds.value = metaData.value.targetComponentIds;
        return;
      }
      if (componentType.value !== undefined && modelId.value !== "") {
        const currentModelId = modelId.value;
        const currentType = componentType.value;
        const ids = await dataStore.getMeshComponentGeodeIds(currentModelId, currentType);
        if (modelId.value === currentModelId && componentType.value === currentType) {
          targetComponentIds.value = ids;
        }
      }
    },
    { immediate: true },
  );

  return { modelId, componentId, componentType, collections, targetComponentIds };
}

export { useModelMenuContext };
