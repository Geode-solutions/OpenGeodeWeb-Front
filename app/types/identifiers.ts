import type { DataId, GeodeId } from "@geode/opengeodeweb-microservice/schema_types";
import type {
  GeodeObjectType,
  ViewerObjectType,
} from "@geode/opengeodeweb-microservice/data_types";

// Id of a component of a model (a corner, a line, a surface or a block): its geode_id
type ModelComponentId = GeodeId;

// The data of an image, the data an image style applies to
type ImageId = DataId;

// The data of a mesh, the data a mesh style applies to
type MeshId = DataId;

// The data of a model, the data a model style or a model component applies to
type ModelId = DataId;

// The viewer objects the viewer can highlight: images are not pickable
type HighlightableObjectType = Exclude<ViewerObjectType, "image">;

// A corner of a model, by its id in the model
type CornerId = ModelComponentId;

// A line of a model, by its id in the model
type LineId = ModelComponentId;

// A surface of a model, by its id in the model
type SurfaceId = ModelComponentId;

// A block of a model, by its id in the model
type BlockId = ModelComponentId;

// A view of the object tree: "main" for the objects view, or the model a model view shows
type TreeViewId = string;

// A node of a tree (a row, a group or a menu entry), unique within its tree
type TreeNodeId = string;

// An extension of the application, by the id its manifest declares
type ExtensionId = string;

// A basemap of the scene, by the id the basemap store gives it
type BasemapId = string;

// A pinia store, by the id it is defined with
type StoreId = string;

// A microservice the application connects to (back, viewer or an extension one)
type MicroserviceId = string;

interface GeodeIdentified {
  geode_id: GeodeId;
}

interface DataIdentified {
  data_id: DataId;
}

interface GeodeObjectTyped {
  geode_object_type: GeodeObjectType;
}

interface ViewerObjectTyped {
  viewer_object_type: ViewerObjectType;
}

// The data a model style or a model component applies to
interface ModelIdentified {
  modelId: ModelId;
}

export type {
  BasemapId,
  BlockId,
  CornerId,
  DataIdentified,
  ExtensionId,
  GeodeIdentified,
  GeodeObjectTyped,
  HighlightableObjectType,
  ImageId,
  LineId,
  MeshId,
  MicroserviceId,
  ModelComponentId,
  ModelId,
  ModelIdentified,
  StoreId,
  SurfaceId,
  TreeNodeId,
  TreeViewId,
  ViewerObjectTyped,
};
