import type { HybridDb, vtkActor as VtkActorInstance } from "./vtk_types";
import { requireRenderWindow, useHybridViewerCore } from "./core";
import { ACTOR_COLOR } from "./constants";
import { useDataStore } from "@ogw_front/stores/data";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";
import { newInstance as vtkActor } from "@kitware/vtk.js/Rendering/Core/Actor";
import { newInstance as vtkMapper } from "@kitware/vtk.js/Rendering/Core/Mapper";
import type vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData";
import { newInstance as vtkXMLPolyDataReader } from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";

// Shared via createSharedComposable (rather than merged into the parent hybridViewer store) so sibling slices, e.g. camera.ts and ruler.ts, can read hybridDb/setZScaling directly without importing the parent store and creating a cycle. A Pinia store would work too but its $id/$patch/... properties would leak into the composed store's spread and collapse its inferred type.
const useHybridViewerScene = createSharedComposable(() => {
  const hybridDb = reactive<HybridDb>({});
  const zScale = ref(1);

  async function addItem(id: string): Promise<void> {
    const { genericRenderWindow } = useHybridViewerCore();
    if (!genericRenderWindow.value) {
      return;
    }
    const dataStore = useDataStore();
    const isViewable = await dataStore.isItemViewable(id);
    if (!isViewable) {
      return;
    }
    const value = await dataStore.item(id);
    const reader = vtkXMLPolyDataReader();
    reader.parseAsArrayBuffer(new TextEncoder().encode(value.binary_light_viewable).buffer);
    const actor = vtkActor();
    const mapper = vtkMapper();
    // oxlint-disable-next-line no-unsafe-type-assertion -- vtk.js's algorithm interface types getOutputData as `any`; this reader always produces polydata.
    const polydata = reader.getOutputData(0) as unknown as vtkPolyData;
    mapper.setInputData(polydata);
    const property = actor.getProperty();
    property.setColor(ACTOR_COLOR);
    actor.setMapper(mapper);
    const renderer = genericRenderWindow.value.getRenderer();
    if (hybridDb[id]) {
      renderer.removeActor(hybridDb[id].actor);
    }
    const actors = renderer.getActors();
    const isFirst = actors.length === 0;
    renderer.addActor(actor);
    if (isFirst) {
      renderer.resetCamera();
    }
    hybridDb[id] = {
      actor,
      polydata,
      mapper,
    };
  }

  function removeItem(id: string): void {
    const { genericRenderWindow } = useHybridViewerCore();
    if (!hybridDb[id]) {
      return;
    }
    const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
    renderer.removeActor(hybridDb[id].actor);
    const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
    renderWindow.render();
    Reflect.deleteProperty(hybridDb, id);
  }

  function setVisibility(id: string, visibility: boolean): void {
    const { genericRenderWindow } = useHybridViewerCore();
    if (!hybridDb[id]) {
      return;
    }
    hybridDb[id].actor.setVisibility(visibility);
    const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
    renderWindow.render();
  }

  async function setZScaling(z_scale: number): Promise<void> {
    const { genericRenderWindow, remoteRender } = useHybridViewerCore();
    zScale.value = z_scale;
    const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
    // oxlint-disable-next-line no-unsafe-type-assertion -- renderer.getActors() is typed as vtkProp[] in vtk.js, but this scene only ever adds vtkActor instances.
    for (const actor of renderer.getActors() as VtkActorInstance[]) {
      const scale = actor.getScale();
      actor.setScale(scale[0] ?? 1, scale[1] ?? 1, z_scale);
    }
    renderer.resetCamera();
    const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
    renderWindow.render();
    const viewerStore = useViewerStore();
    const schema = viewer_schemas.opengeodeweb_viewer.viewer.set_z_scaling;
    const params = {
      z_scale,
    };
    await viewerStore.request({
      schema,
      params,
    });
    await remoteRender();
  }

  function clear(): void {
    const { genericRenderWindow } = useHybridViewerCore();
    const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
    for (const actor of renderer.getActors()) {
      renderer.removeActor(actor);
    }
    const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
    renderWindow.render();
    for (const id of Object.keys(hybridDb)) {
      Reflect.deleteProperty(hybridDb, id);
    }
  }

  return {
    hybridDb,
    zScale,
    addItem,
    removeItem,
    setVisibility,
    setZScaling,
    clear,
  };
});

export { useHybridViewerScene };
