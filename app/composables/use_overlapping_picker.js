import { ref } from "vue";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

export function useOverlappingPicker() {
  const dataStore = useDataStore();
  const dataStyleStore = useDataStyleStore();
  const viewerStore = useViewerStore();
  const dataItems = dataStore.refAllItems();

  const displayIntermediate = ref(false);
  const intermediateItems = ref([]);
  const intermediateMenuX = ref(0);
  const intermediateMenuY = ref(0);
  let resolveIntermediate = undefined;

  function fetchProposedItems(pickedList) {
    return Promise.all(
      pickedList.map(async (pick) => {
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
  }

  function getIntermediateMenuStyle() {
    return {
      position: "fixed",
      left: `${intermediateMenuX.value}px`,
      top: `${intermediateMenuY.value}px`,
    };
  }

  function selectIntermediateItem(item) {
    if (resolveIntermediate) {
      resolveIntermediate(item);
      resolveIntermediate = undefined;
    }
  }

  function handleIntermediateMenuUpdate(val) {
    if (!val && resolveIntermediate) {
      resolveIntermediate(undefined);
      resolveIntermediate = undefined;
    }
  }

  async function get_viewer_id({ x, y, containerWidth, containerHeight, containerRect }) {
    const activeIds = new Set(dataItems.value.map((item) => item.id));
    const ids = Object.keys(dataStyleStore.styles).filter((styleId) => activeIds.has(styleId));

    const result = { id: undefined, viewer_id: undefined };
    let pickedResponse = undefined;
    const schema = viewer_schemas.opengeodeweb_viewer.viewer.picked_ids;
    const params = { x, y, ids };
    await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: (response) => {
          pickedResponse = response;
        },
      },
    );

    if (!pickedResponse || !pickedResponse.array_ids || pickedResponse.array_ids.length === 0) {
      return result;
    }

    const { array_ids, viewer_id, picked_data } = pickedResponse;

    const pickedList = [];
    if (picked_data && picked_data.length > 0) {
      pickedList.push(...picked_data);
    } else {
      for (const pickId of array_ids) {
        pickedList.push({ id: pickId, viewer_id });
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
    return new Promise((resolve) => {
      resolveIntermediate = (chosenResult) => {
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
