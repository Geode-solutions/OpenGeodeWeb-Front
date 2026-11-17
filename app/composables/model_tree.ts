import type {
  CollectionComponent,
  CollectionComponentGroup,
} from "@ogw_front/stores/data_helpers/collections";
import { type FilterableItem, sortAndFormatItems } from "@ogw_front/composables/tree_filter";
import type {
  FormattedComponent,
  FormattedComponentGroup,
} from "@ogw_front/stores/data_helpers/mesh";
import type { ComponentRelations } from "@ogw_front/stores/data_helpers/relations";
import type { ModelId } from "@ogw_front/types/identifiers";
import { compareSelections } from "@ogw_front/utils/treeview";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

type ModelTreeCategory = FormattedComponentGroup | CollectionComponentGroup;
type ModelTreeCache = Record<string, (FormattedComponent | CollectionComponent)[]>;

interface RelationGroup {
  readonly id: string;
  readonly title: string;
  readonly relation: keyof ComponentRelations;
  readonly children: FilterableItem[];
}

const RELATION_GROUPS: readonly { key: keyof ComponentRelations; label: string }[] = [
  { key: "boundaries", label: "Boundaries" },
  { key: "internals", label: "Internals" },
];

// The boundaries and internals of a component, one group each, shown under it in the tree
function relationGroups(
  componentId: string,
  componentRelations: ComponentRelations,
  sortType: string,
): RelationGroup[] {
  return RELATION_GROUPS.filter(({ key }) => componentRelations[key].length > 0).map(
    ({ key, label }) => ({
      id: `${componentId}:${key}`,
      title: `${label} (${componentRelations[key].length})`,
      relation: key,
      children: sortAndFormatItems(componentRelations[key], sortType),
    }),
  );
}

function useModelVisibility(modelId: ModelId): {
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

type WithRelationDetails<Component> = Component & { details?: RelationGroup[] };

// Components get their relations as details: expanding one lists them without making it a
// Branch, so its own visibility stays its own
function attachRelationDetails<Component extends { readonly id: string }>(
  components: readonly Component[],
  relations: Readonly<Record<string, ComponentRelations>>,
  sortType: string,
): WithRelationDetails<Component>[] {
  return components.map((component) => {
    const componentRelations = relations[component.id];
    if (!componentRelations) {
      return component;
    }
    return { ...component, details: relationGroups(component.id, componentRelations, sortType) };
  });
}

export function useModelTree(modelId: ModelId): {
  isLoading: ComputedRef<boolean>;
  localCategories: Ref<ModelTreeCategory[]>;
  cache: Ref<ModelTreeCache | undefined>;
  collectionTypes: Ref<Set<string>>;
  withRelations: typeof withRelations;
} & ReturnType<typeof useModelVisibility> {
  const dataStore = useDataStore();

  const meshGroups = dataStore.refFormatedMeshComponents(modelId);
  const collectionGroups = dataStore.refFormatedCollectionComponents(modelId);
  const cache = ref<ModelTreeCache | undefined>(undefined);
  const localCategories = ref<ModelTreeCategory[]>([]);
  const collectionTypes = ref<Set<string>>(new Set());
  const relations = ref<Record<string, ComponentRelations>>({});

  // The mesh cache also groups collection components by their type; the collections cache overrides those keys with the real collection -> mesh components hierarchy.
  watch(
    [meshGroups, collectionGroups],
    async ([mesh, collections]) => {
      if (!mesh || !collections) {
        return;
      }
      const [meshByType, collectionsByType, relationsByComponent] = await Promise.all([
        dataStore.fetchAllMeshComponents(modelId),
        dataStore.fetchAllCollectionComponents(modelId),
        dataStore.fetchAllComponentRelations(modelId),
      ]);
      relations.value = markRaw(relationsByComponent);
      cache.value = markRaw({ ...meshByType, ...collectionsByType });
      localCategories.value = [...mesh, ...collections];
      collectionTypes.value = new Set(Object.keys(collectionsByType));
    },
    { immediate: true },
  );

  const isLoading = computed(() => cache.value === undefined);

  function withRelations<Component extends { readonly id: string }>(
    categoryId: string,
    components: readonly Component[],
    sortType: string,
  ): WithRelationDetails<Component>[] {
    const byComponent = collectionTypes.value.has(categoryId) ? {} : relations.value;
    return attachRelationDetails(components, byComponent, sortType);
  }

  return {
    isLoading,
    localCategories,
    cache,
    collectionTypes,
    withRelations,
    ...useModelVisibility(modelId),
  };
}
