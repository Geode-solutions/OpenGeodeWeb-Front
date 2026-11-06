// Id given by OpenGeode to an object (a uuid): the same data loaded twice has the same geode_id
type GeodeId = string;

// Id of a data loaded in the app, unique even when the same data is loaded twice (see GeodeId)
type DataId = string;

interface GeodeIdentified {
  geode_id: GeodeId;
}

interface DataIdentified {
  data_id: DataId;
}

export type { DataId, DataIdentified, GeodeId, GeodeIdentified };
