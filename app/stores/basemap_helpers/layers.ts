import type { ComputedRef, Ref } from "vue";
import { type Layer, useBasemapViewer } from "./viewer.js";
import type { BasemapBuildResponse } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { BasemapId } from "@ogw_front/types/identifiers";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { DataName } from "@ogw_front/types/data";
import type { MapStyle } from "@ogw_front/utils/basemap_tree";
import type { Opacity } from "@geode/opengeodeweb-viewer/schema_types";
import { everyMap } from "./extent.js";

// The layers sent to the viewer with a map, serialized to tell whether they changed since
type SentLayers = string;

interface BasemapLayers {
  // The last chosen maps: shown again when the basemap is shown again
  shown: Ref<MapStyle[]>;
  // Shown as soon as the project has a CRS, until the user hides it
  hidden: Ref<boolean>;
  // The visible maps, from the bottom one to the top one
  maps: ComputedRef<MapStyle[]>;
  opacities: Ref<Record<MapStyle, Opacity>>;
  // Cropped: only draped on the top surfaces, out of the flat map around
  crop: Ref<Record<MapStyle, boolean>>;
  // The maps downloaded in the current basemap: the others need a build
  built: Ref<MapStyle[]>;
  layersParams: () => Layer[];
  applyLayers: (id: BasemapId) => Promise<void>;
  // Returns the layers sent: the states changed meanwhile are sent again
  applyBasemap: (
    response: BasemapBuildResponse,
    name: DataName,
    detailOf?: BasemapId,
  ) => Promise<SentLayers>;
}

// The state of each map, and how it reaches the viewer
function useBasemapLayers(georeferencedIds: () => DataId[]): BasemapLayers {
  const { sendLayers, showMap } = useBasemapViewer();
  const shown = ref<MapStyle[]>(["satellite"]);
  const hidden = ref(false);
  const maps = computed<MapStyle[]>(() => (hidden.value ? [] : shown.value));
  const opacities = ref<Record<MapStyle, Opacity>>(everyMap(1));
  const crop = ref<Record<MapStyle, boolean>>(everyMap(false));
  const built = ref<MapStyle[]>([]);

  function layersParams(): Layer[] {
    return built.value.map((map) => ({
      map,
      visible: maps.value.includes(map),
      opacity: opacities.value[map],
      crop: crop.value[map],
    }));
  }

  async function applyLayers(id: BasemapId): Promise<void> {
    await sendLayers(id, layersParams());
  }

  async function applyBasemap(
    response: BasemapBuildResponse,
    name: DataName,
    detailOf?: BasemapId,
  ): Promise<SentLayers> {
    const layers = layersParams();
    await showMap({ response, name, layers, dataIds: georeferencedIds() }, detailOf);
    return JSON.stringify(layers);
  }

  return { shown, hidden, maps, opacities, crop, built, layersParams, applyLayers, applyBasemap };
}

export type { BasemapLayers, SentLayers };
export { useBasemapLayers };
