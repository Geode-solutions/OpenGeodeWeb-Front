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

// The tree selection shows the basemap state: the visible map, or nothing
function withBasemapSelection(selection: readonly string[], style: BasemapStyle): string[] {
  const data = selection.filter((id) => !isBasemapId(id));
  return style === "none" ? data : [...data, mapId(style)];
}

// One map at a time. The classic tree adds the group and every map on a group click:
// That click toggles the basemap, back to the last visible map
function nextBasemapStyle(
  current: BasemapStyle,
  last: MapStyle,
  added: readonly string[],
  removed: readonly string[],
): BasemapStyle {
  const addedMaps = added.flatMap((id) => mapStyleOf(id) ?? []);
  if (added.includes(BASEMAP_GROUP_ID) || addedMaps.length > 1) {
    return current === "none" ? last : "none";
  }
  const [addedMap] = addedMaps;
  if (addedMap !== undefined) {
    return addedMap;
  }
  if (
    removed.includes(BASEMAP_GROUP_ID) ||
    (current !== "none" && removed.includes(mapId(current)))
  ) {
    return "none";
  }
  return current;
}

export type { BasemapStyle, BasemapTreeGroup, MapStyle };
export {
  BASEMAP_GROUP_ID,
  MAP_STYLES,
  basemapGroup,
  isBasemapId,
  mapId,
  mapStyleOf,
  nextBasemapStyle,
  withBasemapSelection,
};
