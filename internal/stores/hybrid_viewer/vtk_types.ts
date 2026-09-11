// vtk.js does not ship first-class TypeScript types for the classes used across the
// hybrid viewer store, so these interfaces only describe the subset of methods and
// properties this codebase actually calls on each object - they are not meant to be
// exhaustive wrappers around the real vtk.js classes.

export type Vector3 = [number, number, number];

export interface CameraOptions {
  focal_point: number[];
  view_up: number[];
  position: number[];
  view_angle: number;
  clipping_range: number[];
  distance: number;
}

export interface VtkCamera {
  getFocalPoint: () => Vector3;
  getViewUp: () => Vector3;
  getPosition: () => Vector3;
  getViewAngle: () => number;
  getClippingRange: () => [number, number];
  getDistance: () => number;
  getDirectionOfProjection: () => Vector3;
  setFocalPoint: (x: number, y: number, z: number) => void;
  setPosition: (x: number, y: number, z: number) => void;
  set: (options: Record<string, unknown>) => void;
  onModified: (callback: () => void) => void;
}

export interface VtkActor {
  getProperty: () => { setColor: (color: Vector3) => void };
  setMapper: (mapper: unknown) => void;
  getScale: () => Vector3;
  setScale: (x: number, y: number, z: number) => void;
  setVisibility: (visible: boolean) => void;
  getBounds: () => number[];
}

export interface VtkRenderer {
  getActiveCamera: () => VtkCamera;
  resetCamera: (bounds?: number[]) => void;
  resetCameraClippingRange: () => void;
  removeActor: (actor: VtkActor) => void;
  addActor: (actor: VtkActor) => void;
  getActors: () => VtkActor[];
}

export interface VtkRenderWindow {
  render: () => void;
}

export interface VtkStyleReference {
  style: CSSStyleDeclaration;
}

export interface VtkWebGLRenderWindow {
  getCanvas: () => HTMLCanvasElement | undefined;
  getContainer: () => HTMLElement | undefined;
  getReferenceByName: (name: string) => VtkStyleReference | undefined;
  setBackgroundImage: (image: unknown) => void;
  setUseBackgroundImage: (value: boolean) => void;
  setSize: (width: number, height: number) => void;
}

export interface GenericRenderWindow {
  getRenderer: () => VtkRenderer;
  getRenderWindow: () => VtkRenderWindow;
  getApiSpecificRenderWindow: () => VtkWebGLRenderWindow;
  setContainer: (el: HTMLElement) => void;
}

export interface HybridDbEntry {
  actor: VtkActor;
  polydata: unknown;
  mapper: unknown;
}

export type HybridDb = Record<string, HybridDbEntry>;
