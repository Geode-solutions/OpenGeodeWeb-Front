import type { ComputedRef, Ref } from "vue";
import { onKeyStroke, watchDebounced } from "@vueuse/core";
import type { Coordinate } from "@ogw_front/types/geometry";
import type { CrsPoint } from "@ogw_front/composables/crs";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// A coordinate as the user types it: a number, or a string not parsed yet
type EditableCoordinate = number | string;

// Which of the source/target point pairs of the alignment
type AlignmentPairIndex = number;

interface EditablePoint {
  x: EditableCoordinate;
  y: EditableCoordinate;
}

// Three pairs: the affine alignment places, rotates, scales and shears the data
const NB_POINTS = 3;
// One preview request once the typing pauses, not one per keystroke
const PREVIEW_DEBOUNCE_MILLISECONDS = 200;
const preview_schema = viewer_schemas.opengeodeweb_viewer.viewer.preview_points;

function emptyPoints(): EditablePoint[] {
  return Array.from({ length: NB_POINTS }, () => ({ x: "", y: "" }));
}

function notPicked(): boolean[] {
  return Array.from({ length: NB_POINTS }, () => false);
}

function toNumber(value: EditableCoordinate | undefined): number {
  return Number(String(value).replaceAll(",", "."));
}

// "" or a partly typed "-" / "." is not a coordinate yet
function isCoordinate(value: EditableCoordinate): boolean {
  return value !== "" && Number.isFinite(toNumber(value));
}

function isFilled(point: EditablePoint): boolean {
  return isCoordinate(point.x) && isCoordinate(point.y);
}

interface UseCrsAlignReturn {
  sourcePoints: Ref<EditablePoint[]>;
  targetPoints: Ref<EditablePoint[]>;
  pickingActive: Ref<boolean>;
  togglePickMode: () => void;
  reset: () => void;
  isComplete: ComputedRef<boolean>;
  toSourceCrsPoints: () => CrsPoint[];
  toTargetCrsPoints: () => CrsPoint[];
  editSourcePoint: (
    index: AlignmentPairIndex,
    coord: keyof EditablePoint,
    value: EditableCoordinate,
  ) => void;
}

interface AlignState {
  sourcePoints: Ref<EditablePoint[]>;
  targetPoints: Ref<EditablePoint[]>;
  pickingActive: Ref<boolean>;
  // Picked z only places the preview markers on the data
  pickedZ: Ref<Coordinate[]>;
  // Picked points lie on the displayed data, typed ones are original coordinates
  pickedSources: Ref<boolean[]>;
}

function pairFilled(
  { sourcePoints, targetPoints }: AlignState,
  index: AlignmentPairIndex,
): boolean {
  const source = sourcePoints.value[index];
  const target = targetPoints.value[index];
  return source !== undefined && target !== undefined && isFilled(source) && isFilled(target);
}

function sourceCrsPoints({ sourcePoints, pickedSources }: AlignState): CrsPoint[] {
  return sourcePoints.value.map((point, index) => ({
    x: toNumber(point.x),
    y: toNumber(point.y),
    picked: pickedSources.value[index] ?? false,
  }));
}

function targetCrsPoints({ targetPoints }: AlignState): CrsPoint[] {
  return targetPoints.value.map((point) => ({ x: toNumber(point.x), y: toNumber(point.y) }));
}

async function preview({ sourcePoints, pickedZ }: AlignState): Promise<void> {
  const points = sourcePoints.value
    .map((point, index) => ({
      x: toNumber(point.x),
      y: toNumber(point.y),
      z: pickedZ.value[index] ?? 0,
      filled: isFilled(point),
    }))
    .filter(({ filled }) => filled)
    .map(({ x, y, z }) => ({ x, y, z }));
  await useViewerStore().request({ schema: preview_schema, params: { points, style: "points" } });
}

// A point picked on the data fills the first empty source point
function placePickedPoint(
  { sourcePoints, pickedZ, pickedSources }: AlignState,
  picked: { x?: Coordinate; y?: Coordinate; z?: Coordinate },
): void {
  if (picked.x === undefined || picked.y === undefined) {
    return;
  }
  const firstEmpty = sourcePoints.value.findIndex((point) => !isFilled(point));
  if (firstEmpty === -1) {
    return;
  }
  sourcePoints.value[firstEmpty] = { x: toNumber(picked.x), y: toNumber(picked.y) };
  pickedZ.value[firstEmpty] = toNumber(picked.z);
  pickedSources.value[firstEmpty] = true;
}

// Picking, preview and Escape follow the viewer while the alignment is mounted
function followViewer(state: AlignState, reset: () => void): void {
  const viewerStore = useViewerStore();
  watch(
    () => viewerStore.picked_point,
    (picked) => {
      if (state.pickingActive.value) {
        placePickedPoint(state, picked);
      }
    },
    { deep: true },
  );
  watchDebounced(
    state.sourcePoints,
    async () => {
      await preview(state);
    },
    {
      deep: true,
      debounce: PREVIEW_DEBOUNCE_MILLISECONDS,
    },
  );
  watch(
    () => viewerStore.picking_mode,
    (pickingMode) => {
      state.pickingActive.value = pickingMode;
    },
  );
  onKeyStroke("Escape", (event) => {
    if (state.pickingActive.value) {
      viewerStore.toggle_picking_mode(false);
      event.stopImmediatePropagation();
    }
  });
  onUnmounted(async () => {
    reset();
    await viewerStore.request({ schema: preview_schema, params: { points: [], style: "points" } });
  });
}

// Source points are picked on the data (only x and y are used) or typed, target points are typed
function useCrsAlign(): UseCrsAlignReturn {
  const viewerStore = useViewerStore();
  const state: AlignState = {
    sourcePoints: ref<EditablePoint[]>(emptyPoints()),
    targetPoints: ref<EditablePoint[]>(emptyPoints()),
    pickingActive: ref(false),
    pickedZ: ref<Coordinate[]>([]),
    pickedSources: ref<boolean[]>(notPicked()),
  };
  const isComplete = computed(() =>
    state.sourcePoints.value.every((_point, index) => pairFilled(state, index)),
  );

  function editSourcePoint(
    index: AlignmentPairIndex,
    coord: keyof EditablePoint,
    value: EditableCoordinate,
  ): void {
    const point = state.sourcePoints.value[index];
    if (!point) {
      return;
    }
    point[coord] = value;
    state.pickedSources.value[index] = false;
  }

  function togglePickMode(): void {
    state.pickingActive.value = !state.pickingActive.value;
    viewerStore.toggle_picking_mode(state.pickingActive.value);
  }

  function reset(): void {
    if (state.pickingActive.value) {
      viewerStore.toggle_picking_mode(false);
    }
    state.sourcePoints.value = emptyPoints();
    state.targetPoints.value = emptyPoints();
    state.pickedZ.value = [];
    state.pickedSources.value = notPicked();
  }

  followViewer(state, reset);

  return {
    sourcePoints: state.sourcePoints,
    targetPoints: state.targetPoints,
    pickingActive: state.pickingActive,
    togglePickMode,
    reset,
    isComplete,
    toSourceCrsPoints: (): CrsPoint[] => sourceCrsPoints(state),
    toTargetCrsPoints: (): CrsPoint[] => targetCrsPoints(state),
    editSourcePoint,
  };
}

export { useCrsAlign };
