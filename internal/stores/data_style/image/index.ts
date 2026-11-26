import type { Opacity, Visibility } from "@geode/opengeodeweb-viewer/schema_types";
import type { ImageId } from "@ogw_front/types/identifiers";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { whenDefined } from "@ogw_internal/stores/data_style/when_defined";

// Local constants
const imageSchemas = viewer_schemas.opengeodeweb_viewer.image;

interface ImageStyleStore {
  imageVisibility: (imageId: ImageId) => Visibility | undefined;
  setImageVisibility: (imageId: ImageId, visibility: Visibility) => Promise<unknown>;
  imageOpacity: (imageId: ImageId) => Opacity | undefined;
  setImageOpacity: (imageId: ImageId, opacity: Opacity) => Promise<unknown>;
  applyImageStyle: (imageId: ImageId) => Promise<unknown[]>;
}

// An image shows its own colors: only its visibility and its opacity are styled
// oxlint-disable-next-line max-lines-per-function
export function useImageStyle(): ImageStyleStore {
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();
  const dataStyleState = useDataStyleState();

  function imageVisibility(imageId: ImageId): Visibility | undefined {
    return dataStyleState.getStyle(imageId).visibility;
  }
  async function setImageVisibility(imageId: ImageId, visibility: Visibility): Promise<unknown> {
    const params = { id: imageId, visibility };
    const result = await viewerStore.request(
      {
        schema: imageSchemas.visibility,
        params,
      },
      {
        response_function: async () => {
          hybridViewerStore.setVisibility(imageId, visibility);
          const mutatedId = await dataStyleState.mutateStyle(imageId, { visibility });
          return mutatedId;
        },
      },
    );
    return result;
  }

  function imageOpacity(imageId: ImageId): Opacity | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- opacity shape is defined by the data style schema.
    return dataStyleState.getStyle(imageId).opacity as Opacity | undefined;
  }
  async function setImageOpacity(imageId: ImageId, opacity: Opacity): Promise<unknown> {
    const params = { id: imageId, opacity };
    const result = await viewerStore.request(
      {
        schema: imageSchemas.opacity,
        params,
      },
      {
        response_function: async () => {
          const mutatedId = await dataStyleState.mutateStyle(imageId, { opacity });
          return mutatedId;
        },
      },
    );
    return result;
  }

  async function applyImageStyle(imageId: ImageId): Promise<unknown[]> {
    const style = dataStyleState.getStyle(imageId);
    const promise_array: unknown[] = [];
    for (const key of Object.keys(style)) {
      if (key === "visibility") {
        promise_array.push(
          whenDefined(imageVisibility(imageId), async (visibility) => {
            const applied = await setImageVisibility(imageId, visibility);
            return applied;
          }),
        );
      } else if (key === "opacity") {
        promise_array.push(
          whenDefined(imageOpacity(imageId), async (opacity) => {
            const applied = await setImageOpacity(imageId, opacity);
            return applied;
          }),
        );
      } else if (key === "data_id") {
        continue;
      } else {
        throw new Error(`Unknown image key: ${key}`);
      }
    }
    const results = await Promise.all(promise_array);
    return results;
  }

  return {
    imageVisibility,
    setImageVisibility,
    imageOpacity,
    setImageOpacity,
    applyImageStyle,
  };
}
