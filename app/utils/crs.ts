import type { CRSList } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { DataItem } from "@ogw_front/stores/data";

function formatCrs(crs: CRSList | undefined): string {
  return crs ? `${crs.authority}:${crs.code} — ${crs.name}` : "None";
}

// Code alone, for narrow places: the full name goes in a tooltip
function formatCrsCode(crs: CRSList | undefined): string {
  return crs ? `${crs.authority}:${crs.code}` : "None";
}

// The project CRS is the first one met: the CRS of the oldest georeferenced data
function projectCrs(items: readonly DataItem[]): CRSList | undefined {
  return items
    .filter((item) => item.crs !== undefined)
    .toSorted((left, right) => left.created_at.localeCompare(right.created_at))[0]?.crs;
}

export { formatCrs, formatCrsCode, projectCrs };
