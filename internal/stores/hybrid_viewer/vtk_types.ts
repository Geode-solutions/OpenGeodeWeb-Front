// Re-exports of vtk.js's own (real, shipped) TypeScript types for the objects the hybrid viewer store composables interact with, plus the handful of shapes that are specific to this codebase (CameraOptions' snake_case wire format, the local hybridDb map, hover highlight data, ...).
import type { vtkCamera } from "@kitware/vtk.js/Rendering/Core/Camera";
import type { vtkRenderer } from "@kitware/vtk.js/Rendering/Core/Renderer";
import type { vtkRenderWindow } from "@kitware/vtk.js/Rendering/Core/RenderWindow";
import type { vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import type { vtkOpenGLRenderWindow } from "@kitware/vtk.js/Rendering/OpenGL/RenderWindow";
import type vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import type { Vector3 } from "@kitware/vtk.js/types";

// The camera state as exchanged with the viewer microservice (snake_case field names, plain arrays) - distinct from vtk.js's own vtkCamera object.
interface CameraOptions {
  focal_point: Vector3;
  view_up: Vector3;
  position: Vector3;
  view_angle: number;
  clipping_range: [number, number];
  distance: number;
}

interface HybridDbEntry {
  actor: vtkActor;
  polydata: unknown;
  mapper: unknown;
}

type HybridDb = Record<string, HybridDbEntry>;

interface HoverComponentInfo {
  name: string;
  id: string;
  type: string;
}

interface HoverData {
  modelId: string;
  modelName: string | undefined;
  blockName: string | undefined;
  pickedId: unknown;
  fieldType: unknown;
  component: HoverComponentInfo | undefined;
  attributes: Record<string, unknown>;
}

// The parent Pinia store (app/stores/hybrid_viewer.ts) assembles these composables via `...spread` and is converted/typed separately from this directory, so its exact inferred return type isn't reliable to build on here. This describes just the slice of its returned (already-unwrapped) state and actions that the composables in this folder read or call directly (i.e. not through `storeToRefs`, which callers type separately at each destructuring site).
interface HybridViewerStorePublic {
  genericRenderWindow: { value: vtkGenericRenderWindow | undefined };
  hybridDb: HybridDb;
  camera_options: Record<string, unknown>;
  remoteRender: () => Promise<void> | void;
  clearHoverHighlight: () => void;
  syncRemoteCamera: () => void;
  hoverHighlight: (event: MouseEvent) => void;
  setZScaling: (value: number) => Promise<void>;
  setCamera: (options: CameraOptions) => void;
}

export type {
  vtkCamera,
  vtkRenderer,
  vtkRenderWindow,
  vtkGenericRenderWindow,
  vtkOpenGLRenderWindow,
  vtkActor,
  Vector3,
  CameraOptions,
  HybridDbEntry,
  HybridDb,
  HoverComponentInfo,
  HoverData,
  HybridViewerStorePublic,
};
