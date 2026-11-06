import { ref } from "vue";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

import type { DataIdentified, GeodeObjectType, ViewerType } from "@ogw_front/types/identifiers";
import { type DataItem, useDataStore } from "@ogw_front/stores/data";
import { computeMenuPosition } from "@ogw_front/composables/overlapping_picker_menu";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

interface PickedItem {
  id: string;
  viewer_id: number | undefined;
}

interface ProposedItem extends DataIdentified {
  viewer_id: number | undefined;
  name: string;
  viewer_type: ViewerType | undefined;
  geode_object_type: GeodeObjectType | undefined;
}

interface ViewerIdResult {
  id: string | undefined;
  viewer_id: number | undefined;
}

interface GetViewerIdParams {
  x: number;
  y: number;
  containerWidth: number;
  containerHeight: number;
  containerRect: { left: number; top: number };
}

interface UseOverlappingPickerReturn {
  displayIntermediate: Ref<boolean>;
  intermediateItems: Ref<ProposedItem[]>;
  intermediateMenuX: Ref<number>;
  intermediateMenuY: Ref<number>;
  getIntermediateMenuStyle: () => { position: string; left: string; top: string };
  selectIntermediateItem: (item: ProposedItem | undefined) => void;
  handleIntermediateMenuUpdate: (val: boolean) => void;
  get_viewer_id: (params: GetViewerIdParams) => Promise<ViewerIdResult>;
}

export function useOverlappingPicker(): UseOverlappingPickerReturn {
  const dataStore = useDataStore();
  const dataStyleStore = useDataStyleStore();
  const viewerStore = useViewerStore();
  const dataItems = dataStore.refAllItems();

  const displayIntermediate = ref(false);
  const intermediateItems = ref<ProposedItem[]>([]);
  const intermediateMenuX = ref(0);
  const intermediateMenuY = ref(0);
  let resolveIntermediate: ((item: ProposedItem | undefined) => void) | undefined = undefined;

  async function fetchProposedItems(pickedList: readonly PickedItem[]): Promise<ProposedItem[]> {
    const proposedItems = await Promise.all(
      pickedList.map(async (pick: PickedItem) => {
        try {
          const item = await dataStore.item(pick.id);
          return {
            data_id: pick.id,
            viewer_id: pick.viewer_id,
            name: item.name || "Unnamed Object",
            viewer_type: item.viewer_type,
            geode_object_type: item.geode_object_type,
          };
        } catch {
          return {
            data_id: pick.id,
            viewer_id: pick.viewer_id,
            name: "Unnamed Object",
            viewer_type: undefined,
            geode_object_type: undefined,
          };
        }
      }),
    );
    return proposedItems;
  }

  function getIntermediateMenuStyle(): { position: string; left: string; top: string } {
    return {
      position: "fixed",
      left: `${intermediateMenuX.value}px`,
      top: `${intermediateMenuY.value}px`,
    };
  }

  function selectIntermediateItem(item: ProposedItem | undefined): void {
    if (resolveIntermediate) {
      resolveIntermediate(item);
      resolveIntermediate = undefined;
    }
  }

  function handleIntermediateMenuUpdate(val: boolean): void {
    if (!val && resolveIntermediate) {
      resolveIntermediate(undefined);
      resolveIntermediate = undefined;
    }
  }

  async function getViewableIds(): Promise<string[]> {
    const activeIds = new Set(dataItems.value.map((i: DataItem) => i.data_id));
    const visibleStyleIds = Object.keys(dataStyleStore.styles).filter(
      (styleId) => activeIds.has(styleId) && dataStyleStore.objectVisibility(styleId) === true,
    );

    const viewableChecks = await Promise.all(
      visibleStyleIds.map(async (styleId) => {
        try {
          return (await dataStore.isItemViewable(styleId)) ? styleId : undefined;
        } catch {
          return undefined;
        }
      }),
    );
    return viewableChecks.filter((id): id is string => Boolean(id));
  }

  function showIntermediateMenu(
    { x, y, containerWidth, containerHeight, containerRect }: GetViewerIdParams,
    itemCount: number,
  ): void {
    const position = computeMenuPosition({ x, y, containerWidth, containerHeight, itemCount });
    intermediateMenuX.value = containerRect.left + position.x;
    intermediateMenuY.value = containerRect.top + position.y;
    displayIntermediate.value = true;
  }

  async function get_viewer_id(params: GetViewerIdParams): Promise<ViewerIdResult> {
    const ids = await getViewableIds();

    const schema = viewer_schemas.opengeodeweb_viewer.viewer.picked_ids;
    const { array_ids, viewer_id } = await viewerStore.request({
      schema,
      params: { x: params.x, y: params.y, ids },
    });

    if (array_ids.length === 0) {
      return { id: undefined, viewer_id: undefined };
    }

    const pickedList: PickedItem[] = array_ids.map((pickId) => ({ id: pickId, viewer_id }));

    if (pickedList.length <= 1) {
      return { id: pickedList[0]?.id, viewer_id: pickedList[0]?.viewer_id };
    }

    const proposedItems = await fetchProposedItems(pickedList);
    intermediateItems.value = proposedItems;
    showIntermediateMenu(params, proposedItems.length);

    /* eslint-disable-next-line promise/avoid-new */
    return new Promise<ViewerIdResult>((resolve) => {
      resolveIntermediate = (chosenResult: ProposedItem | undefined): void => {
        displayIntermediate.value = false;
        if (chosenResult) {
          resolve({ id: chosenResult.data_id, viewer_id: chosenResult.viewer_id });
        } else {
          resolve({ id: undefined, viewer_id: undefined });
        }
      };
    });
  }

  return {
    displayIntermediate,
    intermediateItems,
    intermediateMenuX,
    intermediateMenuY,
    getIntermediateMenuStyle,
    selectIntermediateItem,
    handleIntermediateMenuUpdate,
    get_viewer_id,
  };
}

export type { ViewerIdResult };
