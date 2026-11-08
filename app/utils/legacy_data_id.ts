import type { DataId, DataIdentified } from "@ogw_front/types/identifiers";

// Temporary: the back-end, the viewer and the projects saved before data_id existed still name the data id `id`
type LegacyDataId<Row extends DataIdentified> = Omit<Row, "data_id"> & { id: DataId };

function fromLegacyDataId<Row extends DataIdentified>(row: LegacyDataId<Row> | Row): Row {
  if ("data_id" in row) {
    return row;
  }
  const { id, ...rest } = row;
  // oxlint-disable-next-line no-unsafe-type-assertion -- the other fields of a legacy row are the other fields of Row.
  return { ...rest, data_id: id } as unknown as Row;
}

export type { LegacyDataId };
export { fromLegacyDataId };
