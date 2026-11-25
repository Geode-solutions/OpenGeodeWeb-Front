import type { GeodeImageType, GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";
import type { GeodeObjectTyped, ViewerObjectTyped } from "@ogw_front/types/identifiers";

const IMAGE_TYPES: readonly GeodeObjectType[] = [
  "RasterImage2D",
  "RasterImage3D",
] satisfies GeodeImageType[];

// Temporary: the projects saved before raster images were image objects hold them as meshes
function fromLegacyViewerObjectType<Item extends GeodeObjectTyped & ViewerObjectTyped>(
  item: Item,
): Item {
  if (IMAGE_TYPES.includes(item.geode_object_type) && item.viewer_object_type !== "image") {
    return { ...item, viewer_object_type: "image" };
  }
  return item;
}

export { fromLegacyViewerObjectType };
