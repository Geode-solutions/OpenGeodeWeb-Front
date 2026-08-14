import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

function useHybridViewerRuler() {
  const is_ruler_active = ref(false);
  const ruler_snap = ref(false);
  const ruler_point1 = ref(undefined);
  const ruler_point2 = ref(undefined);
  const ruler_distance = ref(undefined);
  const ruler_awaiting_point = ref(1);
  const ruler_previous_hover_state = ref({ active: false, fieldType: "CELL" });

  function updateRulerSnapHighlight() {
    const hybridViewerStore = useHybridViewerStore();
    const { is_hover_highlight, hover_highlight_field_type } = storeToRefs(hybridViewerStore);
    const { clearHoverHighlight } = hybridViewerStore;

    if (is_ruler_active.value && ruler_snap.value) {
      ruler_previous_hover_state.value = {
        active: is_hover_highlight.value,
        fieldType: hover_highlight_field_type.value,
      };
      is_hover_highlight.value = true;
      hover_highlight_field_type.value = "POINT";
    } else {
      is_hover_highlight.value = ruler_previous_hover_state.value.active;
      hover_highlight_field_type.value = ruler_previous_hover_state.value.fieldType;
      if (!is_hover_highlight.value) {
        clearHoverHighlight();
      }
    }
  }

  watch(is_ruler_active, updateRulerSnapHighlight);
  watch(ruler_snap, updateRulerSnapHighlight);

  async function applyRuler() {
    if (!ruler_point1.value || !ruler_point2.value) {
      return;
    }
    const { remoteRender } = useHybridViewerStore();
    const viewerStore = useViewerStore();
    const schema = viewer_schemas.opengeodeweb_viewer.viewer.ruler;
    const params = {
      point1: ruler_point1.value,
      point2: ruler_point2.value,
    };
    const response = await viewerStore.request({ schema, params });
    ruler_distance.value = response.distance;
    await remoteRender();
  }

  async function handleRulerClick(x, y) {
    const { hybridDb, remoteRender } = useHybridViewerStore();
    const viewerStore = useViewerStore();
    let coords = undefined;
    if (ruler_snap.value) {
      const schema = viewer_schemas.opengeodeweb_viewer.viewer.highlight;
      const params = {
        x: Math.round(x),
        y: Math.round(y),
        field_type: "POINT",
        ids: Object.keys(hybridDb),
      };
      const response = await viewerStore.request({ schema, params });
      coords = response.attributes?.coordinates;
    } else {
      const schema = viewer_schemas.opengeodeweb_viewer.viewer.get_point_position;
      const params = { x: Math.round(x), y: Math.round(y) };
      const response = await viewerStore.request({ schema, params });
      coords = [response.x, response.y, response.z];
    }
    if (!coords) {
      return;
    }

    if (ruler_awaiting_point.value === 1) {
      ruler_point1.value = coords;
      ruler_point2.value = undefined;
      ruler_distance.value = undefined;
      ruler_awaiting_point.value = 2;
      const schema = viewer_schemas.opengeodeweb_viewer.viewer.ruler;
      await viewerStore.request({
        schema,
        params: { point1: coords },
      });
      await remoteRender();
    } else {
      ruler_point2.value = coords;
      ruler_awaiting_point.value = 1;
      await applyRuler();
    }
  }

  function deactivateRuler() {
    const { clearHoverHighlight } = useHybridViewerStore();
    is_ruler_active.value = false;
    clearHoverHighlight();
  }

  async function clearRuler() {
    const { remoteRender } = useHybridViewerStore();
    const viewerStore = useViewerStore();
    ruler_point1.value = undefined;
    ruler_point2.value = undefined;
    ruler_distance.value = undefined;
    ruler_awaiting_point.value = 1;
    deactivateRuler();
    const schema = viewer_schemas.opengeodeweb_viewer.viewer.ruler;
    await viewerStore.request({ schema, params: {} });
    await remoteRender();
  }

  return {
    is_ruler_active,
    ruler_snap,
    ruler_point1,
    ruler_point2,
    ruler_distance,
    ruler_awaiting_point,
    handleRulerClick,
    applyRuler,
    clearRuler,
    deactivateRuler,
  };
}

export { useHybridViewerRuler };
