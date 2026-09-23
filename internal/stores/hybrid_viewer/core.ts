import { Status } from "@ogw_front/utils/status";
import type { ViewStreamLike } from "./vtk_types";
import type { vtkGenericRenderWindow as VtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

interface GenericRenderWindowHolder {
  value?: VtkGenericRenderWindow;
}

// `genericRenderWindow.value` is only ever read from these functions after the viewer has been initialized (see app/stores/hybrid_viewer.ts's initHybridViewer), so requireRenderWindow throwing on that path would indicate a real bug rather than an expected state.
function requireRenderWindow(holder: GenericRenderWindowHolder): VtkGenericRenderWindow {
  if (!holder.value) {
    throw new Error("genericRenderWindow accessed before the viewer was initialized");
  }
  return holder.value;
}

// Render-window, status and drag/pick state shared across the hybrid viewer's slice composables (app/stores/hybrid_viewer.ts and internal/stores/hybrid_viewer/*), plus the debounced remote-render call they all trigger. Shared via createSharedComposable (a singleton per mounted tree, not a Pinia store) so those slices can depend on it directly instead of on the composed hybridViewer store, which would create an import cycle; a real Pinia store here would also pull its own $id/$patch/... properties into the composed store's spread and collapse its inferred type.
const useHybridViewerCore = createSharedComposable(() => {
  const genericRenderWindow = reactive<GenericRenderWindowHolder>({});
  const status = ref(Status.NOT_CREATED);
  const is_moving = ref(false);
  const is_picking = ref(false);
  const viewStream = ref<ViewStreamLike | undefined>(undefined);

  let renderPromise: Promise<void> | undefined = undefined;
  let renderPending = false;

  async function remoteRender(): Promise<void> {
    if (renderPromise) {
      renderPending = true;
      await renderPromise;
      return;
    }

    renderPromise = (async (): Promise<void> => {
      try {
        const viewerStore = useViewerStore();
        const schema = viewer_schemas.opengeodeweb_viewer.viewer.render;
        await viewerStore.request({ schema });
      } finally {
        renderPromise = undefined;
        if (renderPending) {
          renderPending = false;
          await remoteRender();
        }
      }
    })();
    return renderPromise;
  }

  return {
    genericRenderWindow,
    status,
    is_moving,
    is_picking,
    viewStream,
    remoteRender,
  };
});

export { requireRenderWindow, useHybridViewerCore };
export type { GenericRenderWindowHolder };
