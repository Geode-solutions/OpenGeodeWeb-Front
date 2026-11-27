import type {
  CollectionComponent,
  CollectionComponentGroup,
} from "@ogw_internal/stores/data/model/collections";
import { type FilterableItem, sortAndFormatItems } from "@ogw_front/composables/tree_filter";
import type {
  FormattedComponent,
  FormattedComponentGroup,
} from "@ogw_internal/stores/data/model/mesh_components";
import type { Label, SortType, Title } from "@ogw_front/types/ui";
import type { ModelComponentId, ModelId, TreeNodeId } from "@ogw_front/types/identifiers";
import type { ComponentRelations } from "@ogw_internal/stores/data/model/relations";
import type { ModelComponentType } from "@ogw_front/types/model";
import { compareSelections } from "@ogw_front/utils/treeview";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

type ModelTreeCategory = FormattedComponentGroup | CollectionComponentGroup;
type ModelTreeCache = Record<ModelComponentType, (FormattedComponent | CollectionComponent)[]>;

// A component of a model shown in the tree, by its id in the model
interface TreeComponent {
  readonly id: ModelComponentId;
}

interface RelationGroup {
  readonly id: TreeNodeId;
  readonly title: Title;
  readonly relation: keyof ComponentRelations;
  readonly children: FilterableItem[];
}

const RELATION_GROUPS: readonly { key: keyof ComponentRelations; label: Label }[] = [
  { key: "boundaries", label: "Boundaries" },
  { key: "internals", label: "Internals" },
];

// The boundaries and internals of a component, one group each, shown under it in the tree
function relationGroups(
  componentId: ModelComponentId,
  componentRelations: ComponentRelations,
  sortType: SortType,
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

  async function updateVisibility(current: readonly ModelComponentId[]): Promise<void> {
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
// Branch, so its own visibility stays its own. The groups of a component are built once per sort:
// Recomputing the tree (filter, search, cache update) reuses them instead of rebuilding them all
function useRelationDetails(): {
  setRelations: (relations: Record<ModelComponentId, ComponentRelations>) => void;
  attach: <Component extends TreeComponent>(
    components: readonly Component[],
    sortType: SortType,
  ) => WithRelationDetails<Component>[];
} {
  const relations = shallowRef<Readonly<Record<ModelComponentId, ComponentRelations>>>({});
  const groupsByComponent = new Map<ModelComponentId, RelationGroup[]>();
  let groupsSortType: SortType | undefined = undefined;

  function setRelations(newRelations: Record<ModelComponentId, ComponentRelations>): void {
    groupsByComponent.clear();
    relations.value = markRaw(newRelations);
  }

  function groupsOf(
    componentId: ModelComponentId,
    componentRelations: ComponentRelations,
    sortType: SortType,
  ): RelationGroup[] {
    if (sortType !== groupsSortType) {
      groupsByComponent.clear();
      groupsSortType = sortType;
    }
    let groups = groupsByComponent.get(componentId);
    if (groups === undefined) {
      groups = relationGroups(componentId, componentRelations, sortType);
      groupsByComponent.set(componentId, groups);
    }
    return groups;
  }

  function attach<Component extends TreeComponent>(
    components: readonly Component[],
    sortType: SortType,
  ): WithRelationDetails<Component>[] {
    return components.map((component) => {
      const componentRelations = relations.value[component.id];
      if (!componentRelations) {
        return component;
      }
      return { ...component, details: groupsOf(component.id, componentRelations, sortType) };
    });
  }

  return { setRelations, attach };
}

async function fetchModelTreeData(modelId: ModelId): Promise<{
  meshByType: Record<ModelComponentType, FormattedComponent[]>;
  collectionsByType: Record<ModelComponentType, CollectionComponent[]>;
  relations: Record<ModelComponentId, ComponentRelations>;
}> {
  const dataStore = useDataStore();
  const [meshByType, collectionsByType] = await Promise.all([
    dataStore.fetchAllMeshComponents(modelId),
    dataStore.fetchAllCollectionComponents(modelId),
  ]);
  // Boundaries and internals are mesh components: the ones just read are reused
  const relations = await dataStore.fetchAllComponentRelations(
    modelId,
    Object.values(meshByType).flat(),
  );
  return { meshByType, collectionsByType, relations };
}

export function useModelTree(modelId: ModelId): {
  isLoading: ComputedRef<boolean>;
  localCategories: Ref<ModelTreeCategory[]>;
  cache: Ref<ModelTreeCache | undefined>;
  collectionTypes: Ref<Set<ModelComponentType>>;
  withRelations: typeof withRelations;
} & ReturnType<typeof useModelVisibility> {
  const dataStore = useDataStore();

  const meshGroups = dataStore.refFormatedMeshComponents(modelId);
  const collectionGroups = dataStore.refFormatedCollectionComponents(modelId);
  const cache = ref<ModelTreeCache | undefined>(undefined);
  const localCategories = ref<ModelTreeCategory[]>([]);
  const collectionTypes = ref<Set<ModelComponentType>>(new Set());
  const relationDetails = useRelationDetails();

  // The mesh cache also groups collection components by their type; the collections cache overrides those keys with the real collection -> mesh components hierarchy.
  watch(
    [meshGroups, collectionGroups],
    async ([mesh, collections]) => {
      if (!mesh || !collections) {
        return;
      }
      const { meshByType, collectionsByType, relations } = await fetchModelTreeData(modelId);
      relationDetails.setRelations(relations);
      cache.value = markRaw({ ...meshByType, ...collectionsByType });
      localCategories.value = [...mesh, ...collections];
      collectionTypes.value = new Set(Object.keys(collectionsByType));
    },
    { immediate: true },
  );

  const isLoading = computed(() => cache.value === undefined);

  function withRelations<Component extends TreeComponent>(
    categoryId: ModelComponentType,
    components: readonly Component[],
    sortType: SortType,
  ): WithRelationDetails<Component>[] {
    if (collectionTypes.value.has(categoryId)) {
      return [...components];
    }
    return relationDetails.attach(components, sortType);
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
