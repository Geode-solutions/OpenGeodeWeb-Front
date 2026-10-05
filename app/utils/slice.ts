const GRID_TYPES = new Set([
  "RegularGrid2D",
  "LightRegularGrid2D",
  "RegularGrid3D",
  "LightRegularGrid3D",
]);
type SliceAxis = 0 | 1 | 2;
const SLICE_AXES = [
  { title: "YZ", value: 0, next: 1 },
  { title: "XZ", value: 1, next: 2 },
  { title: "XY", value: 2, next: 0 },
] as const satisfies readonly { title: string; value: SliceAxis; next: SliceAxis }[];
const DEFAULT_SLICE_AXIS: SliceAxis = 2;

function areAllGrids(items: { id: string; geode_object_type: string }[], ids: string[]): boolean {
  const targetedItems = items.filter((item) => ids.includes(item.id));
  return (
    targetedItems.length > 0 &&
    targetedItems.every((item) => GRID_TYPES.has(item.geode_object_type))
  );
}

export { SLICE_AXES, DEFAULT_SLICE_AXIS, areAllGrids };
export type { SliceAxis };
