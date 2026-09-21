import { ref } from "vue";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import { type DataItem, useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

interface PickedItem {
  id: string;
  viewer_id: number | undefined;
}

interface ProposedItem {
  id: string;
  viewer_id: number | undefined;
  name: string;
  viewer_type: string | undefined;
  geode_object_type: string | undefined;
}

interface PickedResponse {
  array_ids: string[];
  viewer_id: number | null;
  picked_data?: PickedItem[];
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
  containerRect: Readonly<{ left: number; top: number }>;
}

interface UseOverlappingPickerReturn {
  displayIntermediate: Ref<boolean>;
  intermediateItems: Ref<ProposedItem[]>;
  intermediateMenuX: Ref<number>;
  intermediateMenuY: Ref<number>;
  getIntermediateMenuStyle: () => { position: string; left: string; top: string };
  selectIntermediateItem: (item: Readonly<ProposedItem> | undefined) => void;
  handleIntermediateMenuUpdate: (val: boolean) => void;
  get_viewer_id: (params: Readonly<GetViewerIdParams>) => Promise<ViewerIdResult>;
}

function isPickedItem(entry: unknown): entry is PickedItem {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "id" in entry &&
    typeof entry.id === "string" &&
    (!("viewer_id" in entry) ||
      entry.viewer_id === undefined ||
      typeof entry.viewer_id === "number")
  );
}

function isPickedItemArray(value: unknown): value is PickedItem[] {
  return Array.isArray(value) && value.every((entry) => isPickedItem(entry));
}

function isPickedResponse(value: unknown): value is PickedResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("array_ids" in value) || !("viewer_id" in value)) {
    return false;
  }
  const { array_ids, viewer_id } = value;
  if (
    !Array.isArray(array_ids) ||
    !array_ids.every((entry) => typeof entry === "string") ||
    (typeof viewer_id !== "number" && viewer_id !== null)
  ) {
    return false;
  }
  if ("picked_data" in value) {
    return value.picked_data === undefined || isPickedItemArray(value.picked_data);
  }
  return true;
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
  let resolveIntermediate: ((item: Readonly<ProposedItem> | undefined) => void) | undefined =
    undefined;

  async function fetchProposedItems(
    pickedList: readonly Readonly<PickedItem>[],
  ): Promise<ProposedItem[]> {
    const proposedItems = await Promise.all(
      pickedList.map(async (pick: Readonly<PickedItem>) => {
        try {
          const item = await dataStore.item(pick.id);
          return {
            id: pick.id,
            viewer_id: pick.viewer_id,
            name: item.name || "Unnamed Object",
            viewer_type: item.viewer_type,
            geode_object_type: item.geode_object_type,
          };
        } catch {
          return {
            id: pick.id,
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

  function selectIntermediateItem(item: Readonly<ProposedItem> | undefined): void {
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

  async function get_viewer_id({
    x,
    y,
    containerWidth,
    containerHeight,
    containerRect,
  }: Readonly<GetViewerIdParams>): Promise<ViewerIdResult> {
    const activeIds = new Set(dataItems.value.map((i: Readonly<DataItem>) => i.id));
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
    const ids = viewableChecks.filter((id): id is string => Boolean(id));

    const result: ViewerIdResult = { id: undefined, viewer_id: undefined };
    // A plain `let` reassigned only from inside the response_function closure
    // Below loses its declared type for TS's control-flow narrowing once
    // Control leaves the closure - wrapping it in an object sidesteps that.
    const responseHolder: { pickedResponse: PickedResponse | undefined } = {
      pickedResponse: undefined,
    };
    const schema = viewer_schemas.opengeodeweb_viewer.viewer.picked_ids;
    const params = { x, y, ids };
    await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: (response: unknown) => {
          responseHolder.pickedResponse = isPickedResponse(response) ? response : undefined;
        },
      },
    );
    const { pickedResponse } = responseHolder;

    if (!pickedResponse || pickedResponse.array_ids.length === 0) {
      return result;
    }

    const { array_ids, viewer_id, picked_data } = pickedResponse;

    const pickedList: PickedItem[] = [];
    if (picked_data && picked_data.length > 0) {
      pickedList.push(...picked_data);
    } else {
      for (const pickId of array_ids) {
        pickedList.push({ id: pickId, viewer_id: viewer_id ?? undefined });
      }
    }

    if (pickedList.length <= 1) {
      return { id: pickedList[0]?.id, viewer_id: pickedList[0]?.viewer_id };
    }

    const proposedItems = await fetchProposedItems(pickedList);
    intermediateItems.value = proposedItems;

    const yUI = containerHeight - y;
    const MENU_WIDTH = 340;
    const MENU_BASE_HEIGHT = 55;
    const MENU_ITEM_HEIGHT = 48;
    const MENU_HEIGHT = MENU_BASE_HEIGHT + proposedItems.length * MENU_ITEM_HEIGHT;
    const CLAMP_MARGIN = 10;
    const clampedX = Math.min(
      Math.max(x, CLAMP_MARGIN),
      containerWidth - MENU_WIDTH - CLAMP_MARGIN,
    );
    let clampedY = yUI;
    if (yUI + MENU_HEIGHT > containerHeight - CLAMP_MARGIN) {
      clampedY = Math.max(yUI - MENU_HEIGHT, CLAMP_MARGIN);
    } else {
      clampedY = Math.max(yUI, CLAMP_MARGIN);
    }
    clampedY = Math.min(
      Math.max(clampedY, CLAMP_MARGIN),
      containerHeight - MENU_HEIGHT - CLAMP_MARGIN,
    );

    intermediateMenuX.value = containerRect.left + clampedX;
    intermediateMenuY.value = containerRect.top + clampedY;
    displayIntermediate.value = true;

    /* eslint-disable-next-line promise/avoid-new */
    return new Promise<ViewerIdResult>((resolve) => {
      resolveIntermediate = (chosenResult: Readonly<ProposedItem> | undefined): void => {
        displayIntermediate.value = false;
        resolve(
          chosenResult
            ? { id: chosenResult.id, viewer_id: chosenResult.viewer_id }
            : { id: undefined, viewer_id: undefined },
        );
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
