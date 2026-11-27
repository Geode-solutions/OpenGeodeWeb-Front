import BasemapCropOptions from "@ogw_front/components/Viewer/Basemap/CropOptions.vue";
import BasemapOpacityOptions from "@ogw_front/components/Viewer/Basemap/OpacityOptions.vue";
import type { MenusByObjectType } from "./types.js";

const basemapMenus: MenusByObjectType = {
  Basemap: [BasemapCropOptions],
  Map: [BasemapOpacityOptions, BasemapCropOptions],
};

export { basemapMenus };
