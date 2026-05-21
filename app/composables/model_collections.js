import { compareSelections } from "@ogw_front/utils/treeview";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

export function useModelCollections(viewId) {
  const dataStore = useDataStore();
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();

  const items = dataStore.refFormatedCollectionComponents(viewId);
  const collectionsCache = ref(undefined);
  const localCategories = ref([]);

  onMounted(async () => {
    const data = await dataStore.fetchAllCollectionComponents(viewId);
    collectionsCache.value = markRaw(data);
  });

  watch(
    items,
    async (newItems) => {
      if (!newItems) {
        localCategories.value = [];
        return;
      }
      
      const data = await dataStore.fetchAllCollectionComponents(viewId);
      collectionsCache.value = markRaw(data);
      
      localCategories.value = newItems.map((newCategory) => {
        const existing = localCategories.value.find((category) => category.id === newCategory.id);
        if (existing) {
          existing.title = newCategory.title || newCategory.id;
          return existing;
        }
        return reactive({
          ...newCategory,
          title: newCategory.title || newCategory.id,
        });
      });
    },
    { immediate: true },
  );

  const selection = dataStyleStore.visibleMeshComponents(viewId);

  async function updateVisibility(current) {
    const previous = selection.value;
    const { added, removed } = compareSelections(current, previous);

    if (added.length === 0 && removed.length === 0) {
      return;
    }

    if (added.length > 0) {
      await dataStyleStore.setModelComponentsVisibility(viewId, added, true);
    }
    if (removed.length > 0) {
      await dataStyleStore.setModelComponentsVisibility(viewId, removed, false);
    }
    hybridViewerStore.remoteRender();
  }

  return {
    items,
    collectionsCache,
    localCategories,
    selection,
    updateVisibility,
  };
}
