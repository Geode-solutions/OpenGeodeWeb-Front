// Id given by OpenGeode to an object (a uuid): the same data loaded twice has the same geode_id
type GeodeId = string;

interface GeodeIdentified {
  geode_id: GeodeId;
}

export type { GeodeId, GeodeIdentified };
