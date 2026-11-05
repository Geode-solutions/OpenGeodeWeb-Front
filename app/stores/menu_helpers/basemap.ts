import BasemapCropOptions from "@ogw_front/components/Viewer/Basemap/CropOptions.vue";
import BasemapOpacityOptions from "@ogw_front/components/Viewer/Basemap/OpacityOptions.vue";
import type { MenuItems } from "./types.js";

const basemapMenus: Record<string, MenuItems> = {
  Basemap: [BasemapCropOptions],
  Map: [BasemapOpacityOptions, BasemapCropOptions],
};

export { basemapMenus };
