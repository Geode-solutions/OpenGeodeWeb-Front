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
  BlockId,
  CornerId,
  DataIdentified,
  GeodeIdentified,
  GeodeObjectTyped,
  HighlightableObjectType,
  ImageId,
  LineId,
  MeshId,
  ModelComponentId,
  ModelId,
  ModelIdentified,
  SurfaceId,
  ViewerObjectTyped,
};
