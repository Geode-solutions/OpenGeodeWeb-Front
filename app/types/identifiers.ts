// Id given by OpenGeode to an object (a uuid): the same data loaded twice has the same geode_id
type GeodeId = string;

// Id of a data loaded in the app, unique even when the same data is loaded twice (see GeodeId)
type DataId = string;

// Id of a component of a model (a corner, a line, a surface or a block): its geode_id
type ModelComponentId = GeodeId;

// The data of a mesh, the data a mesh style applies to
type MeshId = DataId;

// The data of a model, the data a model style or a model component applies to
type ModelId = DataId;

// A corner of a model, by its id in the model
type CornerId = ModelComponentId;

// A line of a model, by its id in the model
type LineId = ModelComponentId;

// A surface of a model, by its id in the model
type SurfaceId = ModelComponentId;

// Type of an OpenGeode object, as named by OpenGeode (BRep, TriangulatedSurface3D, ...)
type GeodeObjectType = string;

// What a data is displayed as in the viewer: mesh, model, or an entry of the menus (basemap, model_component, ...)
type ViewerType = string;

interface GeodeIdentified {
  geode_id: GeodeId;
}

interface DataIdentified {
  data_id: DataId;
}

interface GeodeObjectTyped {
  geode_object_type: GeodeObjectType;
}

interface ViewerTyped {
  viewer_type: ViewerType;
}

// The data a model style or a model component applies to
interface ModelIdentified {
  modelId: ModelId;
}

export type {
  CornerId,
  DataId,
  DataIdentified,
  GeodeId,
  GeodeIdentified,
  GeodeObjectType,
  GeodeObjectTyped,
  LineId,
  MeshId,
  ModelComponentId,
  ModelId,
  ModelIdentified,
  SurfaceId,
  ViewerType,
  ViewerTyped,
};
