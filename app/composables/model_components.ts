// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import { compareSelections } from "@ogw_front/utils/treeview";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import type {
  FormattedComponent,
  FormattedComponentGroup,
} from "@ogw_front/stores/data_helpers/mesh";

export function useModelComponents(viewId: string) {
  const dataStore = useDataStore();
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();

  const items = dataStore.refFormatedMeshComponents(viewId);
  const componentsCache = ref<Record<string, FormattedComponent[]> | undefined>(undefined);
  const localCategories = ref<FormattedComponentGroup[]>([]);

  onMounted(async () => {
    const data = await dataStore.fetchAllMeshComponents(viewId);
    componentsCache.value = markRaw(data);
  });

  watch(
    items,
    async (newItems) => {
      if (!newItems) {
        localCategories.value = [];
        return;
      }

      const data = await dataStore.fetchAllMeshComponents(viewId);
      componentsCache.value = markRaw(data);

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

  async function updateVisibility(current: string[]) {
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
    componentsCache,
    localCategories,
    selection,
    updateVisibility,
  };
}
