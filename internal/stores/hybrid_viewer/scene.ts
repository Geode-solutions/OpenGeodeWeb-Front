import { ACTOR_COLOR, RGB_MAX } from "./constants";
import type { HybridDb, HybridDbEntry, vtkActor as VtkActorInstance, vtkCamera } from "./vtk_types";
import { requireRenderWindow, useHybridViewerCore } from "./core";
import viewer_schemas, {
  type ViewerSetBackgroundColorParams,
} from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";
import type { DataId } from "@ogw_front/types/identifiers";
import { base64ToArrayBuffer } from "./base64";
import { getCameraOptions } from "./camera_animation";
import { useDataStore } from "@ogw_front/stores/data";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { newInstance as vtkActor } from "@kitware/vtk.js/Rendering/Core/Actor";
import { newInstance as vtkMapper } from "@kitware/vtk.js/Rendering/Core/Mapper";
import type vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData";
import { newInstance as vtkXMLPolyDataReader } from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";

async function setBackgroundColor(color: ViewerSetBackgroundColorParams["color"]): Promise<void> {
  const { genericRenderWindow, remoteRender } = useHybridViewerCore();
  const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
  renderer.setBackground([color.r / RGB_MAX, color.g / RGB_MAX, color.b / RGB_MAX]);
  const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
  renderWindow.render();
  const viewerStore = useViewerStore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.set_background_color;
  const params = {
    color,
  };
  await viewerStore.request({
    schema,
    params,
  });
  await remoteRender();
}

// The actors are stretched along z around the origin: translate the camera along z so the point it looks at stays under it, keeping the user's view instead of jumping back to the whole scene.
function followZScaling(camera: vtkCamera, ratio: number): void {
  const [focalX, focalY, focalZ] = camera.getFocalPoint();
  const [positionX, positionY, positionZ] = camera.getPosition();
  const offset = focalZ * (ratio - 1);
  camera.setFocalPoint(focalX, focalY, focalZ + offset);
  camera.setPosition(positionX, positionY, positionZ + offset);
}

async function fetchBinaryLightViewable(dataId: DataId): Promise<string | undefined> {
  const dataStore = useDataStore();
  const isViewable = await dataStore.isItemViewable(dataId);
  if (!isViewable) {
    return undefined;
  }
  const value = await dataStore.item(dataId);
  return value.binary_light_viewable;
}

function createHybridDbEntry(binaryLightViewable: string, zScale: number): HybridDbEntry {
  const reader = vtkXMLPolyDataReader();
  reader.parseAsArrayBuffer(base64ToArrayBuffer(binaryLightViewable));
  const actor = vtkActor();
  const mapper = vtkMapper();
  // oxlint-disable-next-line no-unsafe-type-assertion -- vtk.js's algorithm interface types getOutputData as `any`; this reader always produces polydata.
  const polydata = reader.getOutputData(0) as unknown as vtkPolyData;
  mapper.setInputData(polydata);
  const property = actor.getProperty();
  property.setColor(ACTOR_COLOR);
  actor.setMapper(mapper);
  actor.setScale(1, 1, zScale);
  return { actor, polydata, mapper };
}

// Shared via createSharedComposable (rather than merged into the parent hybridViewer store) so sibling slices, e.g. camera.ts and ruler.ts, can read hybridDb/setZScaling directly without importing the parent store and creating a cycle. A Pinia store would work too but its $id/$patch/... properties would leak into the composed store's spread and collapse its inferred type.
const useHybridViewerScene = createSharedComposable(() => {
  const hybridDb = reactive<HybridDb>({});
  const zScale = ref(1);

  async function addItem(dataId: DataId): Promise<void> {
    const { genericRenderWindow } = useHybridViewerCore();
    if (!genericRenderWindow.value) {
      return;
    }
    const binaryLightViewable = await fetchBinaryLightViewable(dataId);
    if (binaryLightViewable === undefined) {
      return;
    }
    // The scene z-scaling also applies to actors added after it was set
    const entry = createHybridDbEntry(binaryLightViewable, zScale.value);
    const renderer = genericRenderWindow.value.getRenderer();
    // Replacing an actor keeps the camera where the user left it
    const isFirst = !hybridDb[dataId] && renderer.getActors().length === 0;
    if (hybridDb[dataId]) {
      renderer.removeActor(hybridDb[dataId].actor);
    }
    renderer.addActor(entry.actor);
    if (isFirst) {
      renderer.resetCamera();
    }
    hybridDb[dataId] = entry;
  }

  function removeItem(dataId: DataId): void {
    const { genericRenderWindow } = useHybridViewerCore();
    if (!hybridDb[dataId]) {
      return;
    }
    const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
    renderer.removeActor(hybridDb[dataId].actor);
    const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
    renderWindow.render();
    Reflect.deleteProperty(hybridDb, dataId);
  }

  function setVisibility(dataId: DataId, visibility: boolean): void {
    const { genericRenderWindow } = useHybridViewerCore();
    if (!hybridDb[dataId]) {
      return;
    }
    hybridDb[dataId].actor.setVisibility(visibility);
    const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
    renderWindow.render();
  }

  async function setZScaling(z_scale: number): Promise<void> {
    const { genericRenderWindow, remoteRender } = useHybridViewerCore();
    const ratio = z_scale / zScale.value;
    zScale.value = z_scale;
    const renderer = requireRenderWindow(genericRenderWindow).getRenderer();
    // oxlint-disable-next-line no-unsafe-type-assertion -- renderer.getActors() is typed as vtkProp[] in vtk.js, but this scene only ever adds vtkActor instances.
    for (const actor of renderer.getActors() as VtkActorInstance[]) {
      const scale = actor.getScale();
      actor.setScale(scale[0] ?? 1, scale[1] ?? 1, z_scale);
    }
    const camera = renderer.getActiveCamera();
    followZScaling(camera, ratio);
    renderer.resetCameraClippingRange();
    const renderWindow = requireRenderWindow(genericRenderWindow).getRenderWindow();
    renderWindow.render();
    const viewerStore = useViewerStore();
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.viewer.set_z_scaling,
      params: {
        z_scale,
      },
    });
    await viewerStore.request({
      schema: viewer_schemas.opengeodeweb_viewer.viewer.update_camera,
      params: {
        camera_options: getCameraOptions(camera),
      },
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
    for (const dataId of Object.keys(hybridDb)) {
      Reflect.deleteProperty(hybridDb, dataId);
    }
  }

  return {
    hybridDb,
    zScale,
    addItem,
    removeItem,
    setVisibility,
    setZScaling,
    setBackgroundColor,
    clear,
  };
});

export { followZScaling, useHybridViewerScene };
