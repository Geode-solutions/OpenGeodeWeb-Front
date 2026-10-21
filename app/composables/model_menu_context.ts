import { type ComputedRef, type Ref, computed, ref, watch } from "vue";
import type { CollectionComponent } from "@ogw_front/stores/data_helpers/collections";
import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import { useDataStore } from "@ogw_front/stores/data";

interface ModelMenuMetaData {
  modelId?: string;
  pickedComponentId?: string;
  viewer_type?: string;
  modelComponentType?: string;
  targetComponentIds?: string[];
}

interface ModelMenuItemProps {
  id: string;
  meta_data: Record<string, unknown>;
}

interface ModelMenuContext {
  modelId: ComputedRef<string>;
  componentId: ComputedRef<string | undefined>;
  componentType: Ref<string | undefined>;
  collections: Ref<CollectionComponent[] | undefined>;
  targetComponentIds: Ref<string[]>;
}

// Resolves what a model context menu targets: the whole model, a component type, a collection or one component
// oxlint-disable-next-line max-lines-per-function
function useModelMenuContext(getItemProps: () => ModelMenuItemProps): ModelMenuContext {
  const dataStore = useDataStore();
  // oxlint-disable-next-line no-unsafe-type-assertion -- meta_data is filled by the viewer context menu with these keys.
  const metaData = computed(() => getItemProps().meta_data as ModelMenuMetaData);

  const modelId = computed<string>(() => metaData.value.modelId ?? getItemProps().id);
  const componentId = computed<string | undefined>(() => metaData.value.pickedComponentId);
  const componentType = ref<string | undefined>(undefined);
  const collections = ref<CollectionComponent[] | undefined>(undefined);

  watch(
    () => [
      modelId.value,
      componentId.value,
      metaData.value.viewer_type,
      metaData.value.modelComponentType,
    ],
    async () => {
      componentType.value = undefined;
      collections.value = undefined;
      if (metaData.value.viewer_type === "model_component_type") {
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
          metaData.value.viewer_type !== "model_component_type"
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
export type { ModelMenuItemProps };
