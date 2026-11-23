import type { CrsItem, NewDataItem } from "@ogw_front/stores/data";
import type { CRS } from "@geode/opengeodeweb-back/schema_types";
import type { LegacyDataId } from "@ogw_front/utils/legacy_data_id";

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

// The X/Y part of a CRS: "A" for a compound "A+B" code, the horizontal part of a registered
// Compound CRS given by the back (e.g. "EPSG:5698" -> "EPSG:2154"), the CRS itself otherwise
function horizontalCode(crs: CRS, horizontalParts: Record<string, string> = {}): string {
  const key = `${crs.authority}:${crs.code}`;
  const [horizontal = crs.code] = crs.code.split("+");
  return horizontalParts[key] ?? `${crs.authority}:${horizontal}`;
}

// Heights are a label of each data: two CRS place X and Y the same when their horizontal parts do
function sameHorizontalCrs(
  left: CRS | undefined,
  right: CRS | undefined,
  horizontalParts: Record<string, string> = {},
): boolean {
  return (
    left !== undefined &&
    right !== undefined &&
    horizontalCode(left, horizontalParts) === horizontalCode(right, horizontalParts)
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

export {
  formatCrs,
  formatCrsCode,
  horizontalCode,
  oldestCrs,
  sameCrs,
  sameCrsState,
  sameHorizontalCrs,
};
