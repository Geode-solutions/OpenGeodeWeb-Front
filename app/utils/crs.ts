import type { CRSList } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";

function formatCrs(crs: CRSList | undefined): string {
  return crs ? `${crs.authority}:${crs.code} — ${crs.name}` : "None";
}

// Code alone, for narrow places: the full name goes in a tooltip
function formatCrsCode(crs: CRSList | undefined): string {
  return crs ? `${crs.authority}:${crs.code}` : "None";
}

export { formatCrs, formatCrsCode };
