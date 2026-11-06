// Id given by OpenGeode to an object (a uuid): the same data loaded twice has the same geode_id
type GeodeId = string;

// Id of a data loaded in the app, unique even when the same data is loaded twice (see GeodeId)
type DataId = string;

// Type of an OpenGeode object, as named by OpenGeode (BRep, TriangulatedSurface3D, ...)
type GeodeObjectType = string;

interface GeodeIdentified {
  geode_id: GeodeId;
}

interface DataIdentified {
  data_id: DataId;
}

interface GeodeObjectTyped {
  geode_object_type: GeodeObjectType;
}

export type { DataId, DataIdentified, GeodeId, GeodeIdentified, GeodeObjectType, GeodeObjectTyped };
