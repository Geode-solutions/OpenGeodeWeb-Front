// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state";
import { useMeshCellsStyle } from "./cells";
import { useMeshEdgesStyle } from "./edges";
import { useMeshPointsStyle } from "./points";
import { useMeshPolygonsStyle } from "./polygons";
import { useMeshPolyhedraStyle } from "./polyhedra";

// Local constants
const meshSchemas = viewer_schemas.opengeodeweb_viewer.mesh;

export function useMeshStyle() {
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();
  const dataStyleState = useDataStyleStateStore();
  const meshPointsStyle = useMeshPointsStyle();
  const meshEdgesStyle = useMeshEdgesStyle();
  const meshCellsStyle = useMeshCellsStyle();
  const meshPolygonsStyle = useMeshPolygonsStyle();
  const meshPolyhedraStyle = useMeshPolyhedraStyle();

  function meshVisibility(id) {
    return dataStyleState.getStyle(id).visibility;
  }
  function setMeshVisibility(id, visibility) {
    return viewerStore.request(
      meshSchemas.visibility,
      { id, visibility },
      {
        response_function: async () => {
          await hybridViewerStore.setVisibility(id, visibility);
          return dataStyleState.mutateStyle(id, { visibility });
        },
      },
    );
  }

  function meshColor(id) {
    return dataStyleState.getStyle(id).color;
  }

  function setMeshColor(id, color) {
    return viewerStore.request(
      meshSchemas.color,
      { id, color },
      {
        response_function: () => dataStyleState.mutateStyle(id, { color }),
      },
    );
  }

  function applyMeshStyle(id) {
    const style = dataStyleState.getStyle(id);
    const promise_array = [];
    for (const [key, value] of Object.entries(style)) {
      if (key === "visibility") {
        promise_array.push(setMeshVisibility(id, value));
      } else if (key === "color") {
        promise_array.push(setMeshColor(id, value));
      } else if (key === "points") {
        promise_array.push(meshPointsStyle.applyMeshPointsStyle(id));
      } else if (key === "edges") {
        promise_array.push(meshEdgesStyle.applyMeshEdgesStyle(id));
      } else if (key === "cells") {
        promise_array.push(meshCellsStyle.applyMeshCellsStyle(id));
      } else if (key === "polygons") {
        promise_array.push(meshPolygonsStyle.applyMeshPolygonsStyle(id));
      } else if (key === "polyhedra") {
        promise_array.push(meshPolyhedraStyle.applyMeshPolyhedraStyle(id));
      } else if (
        key === "corners" ||
        key === "lines" ||
        key === "surfaces" ||
        key === "blocks" ||
        key === "attributes" ||
        key === "id"
      ) {
        // These keys are either handled elsewhere or not applicable to mesh objects
        continue;
      } else {
        throw new Error(`Unknown mesh key: ${key}`);
      }
    }
    return Promise.all(promise_array);
  }

  return {
    meshVisibility,
    setMeshVisibility,
    meshColor,
    setMeshColor,
    applyMeshStyle,
    ...meshPointsStyle,
    ...meshEdgesStyle,
    ...meshCellsStyle,
    ...meshPolygonsStyle,
    ...meshPolyhedraStyle,
  };
}
