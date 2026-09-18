import { useHybridViewerCore } from "./core";
import { useHybridViewerHighlight } from "./highlight";
import { useHybridViewerScene } from "./scene";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

interface RulerHoverState {
  active: boolean;
  fieldType: string;
}

function useHybridViewerRuler(): {
  is_ruler_active: Ref<boolean>;
  ruler_snap: Ref<boolean>;
  ruler_point1: Ref<number[] | undefined>;
  ruler_point2: Ref<number[] | undefined>;
  ruler_distance: Ref<number | undefined>;
  ruler_awaiting_point: Ref<number>;
  handleRulerClick: (x: number, y: number) => Promise<void>;
  applyRuler: () => Promise<void>;
  clearRuler: () => Promise<void>;
  deactivateRuler: () => void;
} {
  const is_ruler_active = ref(false);
  const ruler_snap = ref(false);
  const ruler_point1 = ref<number[] | undefined>(undefined);
  const ruler_point2 = ref<number[] | undefined>(undefined);
  const ruler_distance = ref<number | undefined>(undefined);
  const ruler_awaiting_point = ref(1);
  const ruler_previous_hover_state = ref<RulerHoverState>({ active: false, fieldType: "CELL" });

  function updateRulerSnapHighlight(): void {
    const { is_hover_highlight, hover_highlight_field_type, clearHoverHighlight } =
      useHybridViewerHighlight();

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

  watch([is_ruler_active, ruler_snap], updateRulerSnapHighlight);

  async function applyRuler(): Promise<void> {
    if (!ruler_point1.value) {
      return;
    }
    const points = ruler_point2.value
      ? [ruler_point1.value, ruler_point2.value]
      : [ruler_point1.value];
    const { remoteRender } = useHybridViewerCore();
    const viewerStore = useViewerStore();
    const schema = viewer_schemas.opengeodeweb_viewer.viewer.ruler;
    // oxlint-disable-next-line no-unsafe-type-assertion -- response shape is defined by the ruler schema.
    const response = (await viewerStore.request({ schema, params: { points } })) as {
      distance?: number;
    };
    ruler_distance.value = response.distance;
    await remoteRender();
  }

  async function handleRulerClick(x: number, y: number): Promise<void> {
    const { hybridDb } = useHybridViewerScene();
    const viewerStore = useViewerStore();
    let coords: number[] | undefined = undefined;
    if (ruler_snap.value) {
      const schema = viewer_schemas.opengeodeweb_viewer.viewer.highlight;
      const params = {
        x: Math.round(x),
        y: Math.round(y),
        field_type: "POINT",
        ids: Object.keys(hybridDb),
      };
      // oxlint-disable-next-line no-unsafe-type-assertion -- response shape is defined by the highlight schema.
      const response = (await viewerStore.request({ schema, params })) as {
        attributes?: { coordinates?: number[] };
      };
      coords = response.attributes?.coordinates;
    } else {
      const schema = viewer_schemas.opengeodeweb_viewer.viewer.get_point_position;
      const params = { x: Math.round(x), y: Math.round(y) };
      // oxlint-disable-next-line no-unsafe-type-assertion -- response shape is defined by the get_point_position schema.
      const response = (await viewerStore.request({ schema, params })) as {
        x: number;
        y: number;
        z: number;
      };
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
    } else {
      ruler_point2.value = coords;
      ruler_awaiting_point.value = 1;
    }
    await applyRuler();
  }

  function deactivateRuler(): void {
    const { clearHoverHighlight } = useHybridViewerHighlight();
    is_ruler_active.value = false;
    clearHoverHighlight();
  }

  async function clearRuler(): Promise<void> {
    ruler_point1.value = undefined;
    ruler_point2.value = undefined;
    ruler_distance.value = undefined;
    ruler_awaiting_point.value = 1;
    deactivateRuler();
    const { remoteRender } = useHybridViewerCore();
    const viewerStore = useViewerStore();
    const schema = viewer_schemas.opengeodeweb_viewer.viewer.reset_ruler;
    await viewerStore.request({ schema });
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
