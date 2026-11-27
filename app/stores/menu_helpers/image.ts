import ImageOptions from "@ogw_front/components/Viewer/Image/ImageOptions.vue";
import type { MenusByObjectType } from "./types.js";

const Image_menu = [ImageOptions];

const imageMenus: MenusByObjectType = {
  RasterImage2D: Image_menu,
  RasterImage3D: Image_menu,
};

export { imageMenus };
