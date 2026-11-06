import type { MeshId } from "@ogw_front/types/identifiers";
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
  meshVisibility: (meshId: MeshId) => boolean | undefined;
  setMeshVisibility: (meshId: MeshId, visibility: boolean) => Promise<unknown>;
  meshColor: (meshId: MeshId) => RGBAColor | undefined;
  setMeshColor: (meshId: MeshId, color: RGBAColor) => Promise<unknown>;
}

export function useMeshBaseStyle(): MeshBaseStyle {
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();
  const dataStyleState = useDataStyleState();

  function meshVisibility(meshId: MeshId): boolean | undefined {
    return dataStyleState.getStyle(meshId).visibility;
  }
  async function setMeshVisibility(meshId: MeshId, visibility: boolean): Promise<unknown> {
    const schema = meshSchemas.visibility;
    const params = { id: meshId, visibility };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          if (visibility !== undefined) {
            hybridViewerStore.setVisibility(meshId, visibility);
          }
          const mutatedId = await dataStyleState.mutateStyle(meshId, { visibility });
          return mutatedId;
        },
      },
    );
    return result;
  }

  function meshColor(meshId: MeshId): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- color shape is defined by the data style schema.
    return dataStyleState.getStyle(meshId).color as RGBAColor | undefined;
  }

  async function setMeshColor(meshId: MeshId, color: RGBAColor): Promise<unknown> {
    const schema = meshSchemas.color;
    const params = { id: meshId, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutatedId = await dataStyleState.mutateStyle(meshId, { color });
          return mutatedId;
        },
      },
    );
    return result;
  }

  return { meshVisibility, setMeshVisibility, meshColor, setMeshColor };
}
