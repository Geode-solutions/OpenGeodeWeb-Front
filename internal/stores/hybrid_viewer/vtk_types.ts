import type { Vector3 } from "@kitware/vtk.js/types";
import type vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";

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

// The image stream object returned by vtk.js's ImageStream.createViewStream(); vtk.js's own vtkViewStream type declares `onImageReady` with a zero-arg callback, which doesn't match how it's actually invoked at runtime (with the decoded image), so this describes the shape as it's actually used here.
interface ViewStreamLike {
  setSize: (width: number, height: number) => void;
  onImageReady: (callback: (event: { image: unknown }) => void) => void;
}

export type { Vector3 } from "@kitware/vtk.js/types";
export type { default as vtkActor } from "@kitware/vtk.js/Rendering/Core/Actor";
export type { vtkCamera } from "@kitware/vtk.js/Rendering/Core/Camera";
export type { vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
export type { vtkOpenGLRenderWindow } from "@kitware/vtk.js/Rendering/OpenGL/RenderWindow";
export type { vtkRenderWindow } from "@kitware/vtk.js/Rendering/Core/RenderWindow";
export type { vtkRenderer } from "@kitware/vtk.js/Rendering/Core/Renderer";
export type {
  CameraOptions,
  HybridDbEntry,
  HybridDb,
  HoverComponentInfo,
  HoverData,
  ViewStreamLike,
};
