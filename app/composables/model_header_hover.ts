import { releaseHoverHighlight, useHoverhighlight } from "@ogw_front/composables/hover_highlight";
import type { ModelId } from "@ogw_front/types/identifiers";
import { useDataStore } from "@ogw_front/stores/data";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

// Hovering a model tree header shows its model in the viewer and its row in the objects tree
export function useModelHeaderHover(): {
  onModelHeaderEnter: (modelId: ModelId) => void;
  onModelHeaderLeave: (modelId: ModelId) => void;
} {
  const treeviewStore = useTreeviewStore();
  const dataStore = useDataStore();
  const { onHoverEnter, onHoverLeave } = useHoverhighlight();

  function onModelHeaderEnter(modelId: ModelId): void {
    treeviewStore.setHoveredModel(modelId);
    onHoverEnter(
      modelId,
      async () => {
        const viewerIds = await dataStore.getAllModelComponentsViewerIds(modelId);
        return viewerIds;
      },
      "model",
    );
  }

  function onModelHeaderLeave(modelId: ModelId): void {
    if (treeviewStore.hoveredModelId === modelId) {
      treeviewStore.setHoveredModel(undefined);
    }
    onHoverLeave(modelId);
  }

  // A view closed under the cursor never gets its mouseleave: release what its hover started
  watch(
    () => treeviewStore.opened_views.map((view) => view.id),
    (newIds, oldIds) => {
      for (const viewId of oldIds) {
        if (!newIds.includes(viewId)) {
          releaseHoverHighlight(viewId);
        }
      }
    },
  );

  return { onModelHeaderEnter, onModelHeaderLeave };
}
