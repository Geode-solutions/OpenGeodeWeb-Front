import type { CrsItem, NewDataItem } from "@ogw_front/stores/data";
import type { CRS } from "@geode/opengeodeweb-back/schema_types";
import type { LegacyDataId } from "@ogw_front/utils/legacy_data_id";
import { z } from "zod";

// Only what a CRS selector shows: the back may add other fields
interface CrsEntry {
  authority: string;
  code: string;
  name: string;
}

// A stored CRS entry (favorites, history): unknown fields are dropped on read
const crsEntrySchema = z.object({
  authority: z.string(),
  code: z.string(),
  name: z.string(),
});

function formatCrs(crs: CRS | undefined): string {
  return crs ? `${crs.authority}:${crs.code} — ${crs.name}` : "None";
}

// Code alone, for narrow places: the full name goes in a tooltip
function formatCrsCode(crs: CRS | undefined): string {
  return crs ? `${crs.authority}:${crs.code}` : "None";
}

// The name is only a label: two CRS are the same when their authority code is
function sameCrs(left: CRS | undefined, right: CRS | undefined): boolean {
  return (
    left !== undefined &&
    right !== undefined &&
    left.authority === right.authority &&
    left.code === right.code
  );
}

// Same CRS, or both still in local coordinates
function sameCrsState(left: CRS | undefined, right: CRS | undefined): boolean {
  return (left === undefined && right === undefined) || sameCrs(left, right);
}

// The CRS of the oldest georeferenced data: the project CRS of a project saved before it was stored
function oldestCrs(
  items:
    | readonly Pick<CrsItem, "crs" | "created_at">[]
    | readonly (LegacyDataId<NewDataItem> | NewDataItem)[],
): CRS | undefined {
  return items
    .filter((item) => item.crs !== undefined)
    .toSorted((left, right) => (left.created_at ?? "").localeCompare(right.created_at ?? ""))[0]
    ?.crs;
}

export type { CrsEntry };
export { crsEntrySchema, formatCrs, formatCrsCode, oldestCrs, sameCrs, sameCrsState };
