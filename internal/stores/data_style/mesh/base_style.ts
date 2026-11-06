import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

// Local constants
const meshSchemas = viewer_schemas.opengeodeweb_viewer.mesh;

interface MeshBaseStyle {
  meshVisibility: (id: string) => boolean | undefined;
  setMeshVisibility: (id: string, visibility: boolean) => Promise<unknown>;
  meshColor: (id: string) => RGBAColor | undefined;
  setMeshColor: (id: string, color: RGBAColor) => Promise<unknown>;
}

export function useMeshBaseStyle(): MeshBaseStyle {
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();
  const dataStyleState = useDataStyleState();

  function meshVisibility(id: string): boolean | undefined {
    return dataStyleState.getStyle(id).visibility;
  }
  async function setMeshVisibility(id: string, visibility: boolean): Promise<unknown> {
    const schema = meshSchemas.visibility;
    const params = { id, visibility };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          if (visibility !== undefined) {
            hybridViewerStore.setVisibility(id, visibility);
          }
          const mutatedId = await dataStyleState.mutateStyle(id, { visibility });
          return mutatedId;
        },
      },
    );
    return result;
  }

  function meshColor(id: string): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- color shape is defined by the data style schema.
    return dataStyleState.getStyle(id).color as RGBAColor | undefined;
  }

  async function setMeshColor(id: string, color: RGBAColor): Promise<unknown> {
    const schema = meshSchemas.color;
    const params = { id, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutatedId = await dataStyleState.mutateStyle(id, { color });
          return mutatedId;
        },
      },
    );
    return result;
  }

  return { meshVisibility, setMeshVisibility, meshColor, setMeshColor };
}
