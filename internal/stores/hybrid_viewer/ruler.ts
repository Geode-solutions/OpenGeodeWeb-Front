import viewer_schemas, {
  type PickedFieldType,
} from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";
import { useHybridViewerCore } from "./core";
import { useHybridViewerHighlight } from "./highlight";
import { useHybridViewerScene } from "./scene";
import { useViewerStore } from "@ogw_front/stores/viewer";

interface RulerHoverState {
  active: boolean;
  fieldType: PickedFieldType;
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
  // Hover highlight state overridden by the snap, restored when snapping stops. Without snap the ruler leaves the hover highlight untouched.
  let hover_state_before_snap: RulerHoverState | undefined = undefined;

  function updateRulerSnapHighlight(): void {
    const { is_hover_highlight, hover_highlight_field_type, clearHoverHighlight } =
      useHybridViewerHighlight();

    if (is_ruler_active.value && ruler_snap.value) {
      hover_state_before_snap = {
        active: is_hover_highlight.value,
        fieldType: hover_highlight_field_type.value,
      };
      is_hover_highlight.value = true;
      hover_highlight_field_type.value = "POINT";
    } else if (hover_state_before_snap) {
      is_hover_highlight.value = hover_state_before_snap.active;
      hover_highlight_field_type.value = hover_state_before_snap.fieldType;
      hover_state_before_snap = undefined;
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
    const { distance } = await viewerStore.request({ schema, params: { points } });
    ruler_distance.value = distance;
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
        field_type: "POINT" as const,
        ids: Object.keys(hybridDb),
      };
      const { attributes } = await viewerStore.request({ schema, params });
      const coordinates = attributes?.coordinates;
      coords = Array.isArray(coordinates) ? coordinates : undefined;
    } else {
      coords = await viewerStore.pick_world_position(x, y);
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
