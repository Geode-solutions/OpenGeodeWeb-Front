import type { CollectionComponentGroup } from "@ogw_front/stores/data_helpers/collections";
import type { FormattedComponentGroup } from "@ogw_front/stores/data_helpers/mesh";
import { useModelCollections } from "@ogw_front/composables/model_collections";
import { useModelComponents } from "@ogw_front/composables/model_components";

type ModelComponents = ReturnType<typeof useModelComponents>;
type ModelCollections = ReturnType<typeof useModelCollections>;

export function useModelTree(modelId: string): {
  items: ModelComponents["items"];
  localCategories: ComputedRef<(FormattedComponentGroup | CollectionComponentGroup)[]>;
  meshCache: ModelComponents["componentsCache"];
  collectionsCache: ModelCollections["collectionsCache"];
  collectionTypes: ComputedRef<Set<string>>;
  selection: ModelComponents["selection"];
  updateVisibility: ModelComponents["updateVisibility"];
} {
  const components = useModelComponents(modelId);
  const collections = useModelCollections(modelId);

  const localCategories = computed(() => [
    ...components.localCategories.value,
    ...collections.localCategories.value,
  ]);

  const collectionTypes = computed(
    () => new Set(collections.localCategories.value.map((category) => category.id)),
  );

  return {
    items: components.items,
    localCategories,
    meshCache: components.componentsCache,
    collectionsCache: collections.collectionsCache,
    collectionTypes,
    selection: components.selection,
    updateVisibility: components.updateVisibility,
  };
}
