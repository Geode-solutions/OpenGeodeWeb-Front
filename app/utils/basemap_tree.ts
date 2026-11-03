type MapStyle = "satellite" | "streets" | "topo";
type BasemapStyle = "none" | MapStyle;

interface BasemapTreeGroup {
  id: string;
  title: string;
  children: { id: string; title: string }[];
}

const MAP_STYLES: readonly MapStyle[] = ["satellite", "streets", "topo"];
const MAP_TITLES: Record<MapStyle, string> = {
  satellite: "Satellite",
  streets: "Streets",
  topo: "Topo",
};
const BASEMAP_GROUP_ID = "basemap";
const MAP_ID_PREFIX = `${BASEMAP_GROUP_ID}:`;

function mapId(style: MapStyle): string {
  return `${MAP_ID_PREFIX}${style}`;
}

function mapStyleOf(id: string): MapStyle | undefined {
  return MAP_STYLES.find((style) => mapId(style) === id);
}

// The fixed stacking order, from the bottom: the imagery under the maps, streets on top
const STACKED_MAPS: readonly MapStyle[] = ["satellite", "topo", "streets"];

function sortedMaps(maps: readonly string[]): MapStyle[] {
  return STACKED_MAPS.filter((style) => maps.includes(style));
}

function mapLayer(style: MapStyle): number {
  return STACKED_MAPS.indexOf(style);
}

// Tree ids of the basemap: never project data
function isBasemapId(id: string): boolean {
  return id === BASEMAP_GROUP_ID || id.startsWith(MAP_ID_PREFIX);
}

function basemapGroup(): BasemapTreeGroup {
  return {
    id: BASEMAP_GROUP_ID,
    title: "Basemap",
    children: MAP_STYLES.map((style) => ({ id: mapId(style), title: MAP_TITLES[style] })),
  };
}

// The tree selection shows the basemap state: the visible maps
function withBasemapSelection(selection: readonly string[], maps: readonly MapStyle[]): string[] {
  const data = selection.filter((id) => !isBasemapId(id));
  return [...data, ...maps.map((style) => mapId(style))];
}

// Each map eye shows or hides its map. The classic tree adds the group and every map on a
// Group click: that click hides the visible maps, or shows the last visible maps again
function nextBasemapMaps(
  current: readonly MapStyle[],
  last: readonly MapStyle[],
  added: readonly string[],
  removed: readonly string[],
): MapStyle[] {
  const addedMaps = added.flatMap((id) => mapStyleOf(id) ?? []);
  if (added.includes(BASEMAP_GROUP_ID) || addedMaps.length > 1) {
    return current.length === 0 ? [...last] : [];
  }
  const removedMaps = removed.flatMap((id) => mapStyleOf(id) ?? []);
  if (removed.includes(BASEMAP_GROUP_ID) && removedMaps.length === 0) {
    return [];
  }
  return sortedMaps([...current, ...addedMaps].filter((style) => !removedMaps.includes(style)));
}

export type { BasemapStyle, BasemapTreeGroup, MapStyle };
export {
  BASEMAP_GROUP_ID,
  MAP_STYLES,
  basemapGroup,
  isBasemapId,
  mapId,
  mapLayer,
  mapStyleOf,
  nextBasemapMaps,
  sortedMaps,
  withBasemapSelection,
};
