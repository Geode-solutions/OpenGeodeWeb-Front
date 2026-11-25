import ImageOptions from "@ogw_front/components/Viewer/Image/ImageOptions.vue";
import type { MenuItems } from "./types.js";

const Image_menu = [ImageOptions];

const imageMenus: Record<string, MenuItems> = {
  RasterImage2D: Image_menu,
  RasterImage3D: Image_menu,
};

export { imageMenus };
