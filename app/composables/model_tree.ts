import type {
  CollectionComponent,
  CollectionComponentGroup,
} from "@ogw_front/stores/data_helpers/collections";
import type {
  FormattedComponent,
  FormattedComponentGroup,
} from "@ogw_front/stores/data_helpers/mesh";
import { compareSelections } from "@ogw_front/utils/treeview";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

type ModelTreeCategory = FormattedComponentGroup | CollectionComponentGroup;
type ModelTreeCache = Record<string, (FormattedComponent | CollectionComponent)[]>;

function useModelVisibility(modelId: string): {
  selection: typeof selection;
  updateVisibility: typeof updateVisibility;
} {
  const dataStyleStore = useDataStyleStore();
  const hybridViewerStore = useHybridViewerStore();
  const selection = dataStyleStore.visibleMeshComponents(modelId);

  async function updateVisibility(current: readonly string[]): Promise<void> {
    const { added, removed } = compareSelections([...current], selection.value);
    if (added.length > 0) {
      await dataStyleStore.setModelComponentsVisibility(modelId, added, true);
    }
    if (removed.length > 0) {
      await dataStyleStore.setModelComponentsVisibility(modelId, removed, false);
    }
    if (added.length > 0 || removed.length > 0) {
      await hybridViewerStore.remoteRender();
    }
  }

  return { selection, updateVisibility };
}

export function useModelTree(modelId: string): {
  isLoading: ComputedRef<boolean>;
  localCategories: Ref<ModelTreeCategory[]>;
  cache: Ref<ModelTreeCache | undefined>;
  collectionTypes: Ref<Set<string>>;
} & ReturnType<typeof useModelVisibility> {
  const dataStore = useDataStore();

  const meshGroups = dataStore.refFormatedMeshComponents(modelId);
  const collectionGroups = dataStore.refFormatedCollectionComponents(modelId);
  const cache = ref<ModelTreeCache | undefined>(undefined);
  const localCategories = ref<ModelTreeCategory[]>([]);
  const collectionTypes = ref<Set<string>>(new Set());

  // The mesh cache also groups collection components by their type; the collections cache overrides those keys with the real collection -> mesh components hierarchy.
  watch(
    [meshGroups, collectionGroups],
    async ([mesh, collections]) => {
      if (!mesh || !collections) {
        return;
      }
      const [meshByType, collectionsByType] = await Promise.all([
        dataStore.fetchAllMeshComponents(modelId),
        dataStore.fetchAllCollectionComponents(modelId),
      ]);
      cache.value = markRaw({ ...meshByType, ...collectionsByType });
      localCategories.value = [...mesh, ...collections];
      collectionTypes.value = new Set(Object.keys(collectionsByType));
    },
    { immediate: true },
  );

  const isLoading = computed(() => cache.value === undefined);

  return {
    isLoading,
    localCategories,
    cache,
    collectionTypes,
    ...useModelVisibility(modelId),
  };
}
