import type { DataItem, NewDataItem } from "@ogw_front/stores/data";
import type { CRSList } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";

function formatCrs(crs: CRSList | undefined): string {
  return crs ? `${crs.authority}:${crs.code} — ${crs.name}` : "None";
}

// Code alone, for narrow places: the full name goes in a tooltip
function formatCrsCode(crs: CRSList | undefined): string {
  return crs ? `${crs.authority}:${crs.code}` : "None";
}

// The name is only a label: two CRS are the same when their authority code is
function sameCrs(left: CRSList | undefined, right: CRSList | undefined): boolean {
  return (
    left !== undefined &&
    right !== undefined &&
    left.authority === right.authority &&
    left.code === right.code
  );
}

// The CRS of the oldest georeferenced data: the project CRS of a project saved before it was stored
function oldestCrs(
  items: readonly Pick<DataItem, "crs" | "created_at">[] | readonly NewDataItem[],
): CRSList | undefined {
  return items
    .filter((item) => item.crs !== undefined)
    .toSorted((left, right) => (left.created_at ?? "").localeCompare(right.created_at ?? ""))[0]
    ?.crs;
}

export { formatCrs, formatCrsCode, oldestCrs, sameCrs };
