import type { Opacity, Visibility } from "@geode/opengeodeweb-viewer/schema_types";

interface ImageStyle {
  visibility: Visibility;
  opacity: Opacity;
}

function imageDefaultStyle(): ImageStyle {
  return {
    visibility: true,
    opacity: 1,
  };
}

export { imageDefaultStyle };
export type { ImageStyle };
