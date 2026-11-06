// Id given by OpenGeode to an object (a uuid): the same data loaded twice has the same geode_id
type GeodeId = string;

// Id of a data loaded in the app, unique even when the same data is loaded twice (see GeodeId)
type DataId = string;

// Id of a component of a model (a corner, a line, a surface or a block): its geode_id
type ModelComponentId = GeodeId;

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

export type {
  DataId,
  DataIdentified,
  GeodeId,
  GeodeIdentified,
  GeodeObjectType,
  GeodeObjectTyped,
  ModelComponentId,
  ViewerType,
  ViewerTyped,
};
