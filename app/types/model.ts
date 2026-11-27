import type { ViewerId } from "@geode/opengeodeweb-viewer/schema_types";

// The type of a component of a model, as the back names it: "Corner", "Line", "Surface", "Block" or a collection type
type ModelComponentType = string;

// How a component of a model relates to another: "boundary" or "internal"
type ModelComponentRelationType = string;

// The name of a component of a model, as the model file gives it
type ModelComponentName = string;

// The viewer id of a component of a model, as the viewer picks it or as stored
type ModelComponentViewerId = ViewerId | string;

export type {
  ModelComponentName,
  ModelComponentRelationType,
  ModelComponentType,
  ModelComponentViewerId,
};
