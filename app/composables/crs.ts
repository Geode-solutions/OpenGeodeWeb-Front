import type { AssignResponse, PlausibleEntry } from "@ogw_front/composables/crs_assign";
import { type DataItem, useDataStore } from "@ogw_front/stores/data";
import { formatCrsCode, sameCrs } from "@ogw_front/utils/crs";
import type { CRS } from "@geode/opengeodeweb-back/schema_types";
import type { Coordinate } from "@ogw_front/types/geometry";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { LightViewable } from "@ogw_front/types/data";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { reloadObject } from "@ogw_front/utils/reload_object";
import { useBackStore } from "@ogw_front/stores/back";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface CrsPoint {
  x: Coordinate;
  y: Coordinate;
  // Source points only: picked on the displayed data rather than typed
  picked?: boolean;
}

interface Alignment {
  sourcePoints: CrsPoint[];
  targetPoints: CrsPoint[];
  // Data sharing the local frame of the aligned item: aligned in the same request
  linkedItems?: Pick<DataItem, "data_id">[];
}

// How an assignment treats the data sharing the local frame of the assigned item
interface AssignCrsOptions {
  linkedItems?: Pick<DataItem, "data_id">[];
  onlyPlausible?: boolean;
}

// Whether a conversion moves the camera, and the data converted in the same request
interface ConvertCrsOptions {
  focus?: boolean;
  linkedItems?: Pick<DataItem, "data_id">[];
}

// What the back returns for a data whose coordinates it moved
interface MovedData {
  binary_light_viewable?: LightViewable;
  crs?: CRS;
}

interface UseCrsReturn {
  assignCrs: (
    item: Pick<DataItem, "data_id">,
    crs: CRS,
    options?: AssignCrsOptions,
  ) => Promise<AssignResponse>;
  convertCrs: (
    item: Pick<DataItem, "data_id">,
    crs: CRS,
    options?: ConvertCrsOptions,
  ) => Promise<void>;
  alignCrs: (item: DataItem, crs: CRS, alignment: Alignment) => Promise<void>;
  changeProjectCrs: (crs: CRS) => Promise<void>;
  followProject: (entries: PlausibleEntry[], project?: CRS) => Promise<void>;
}

// Converting or aligning rewrites the data coordinates: the viewer object is reloaded and the camera moved to it
async function refresh(
  item: Pick<DataItem, "data_id">,
  { binary_light_viewable, crs }: MovedData,
  focus = true,
): Promise<void> {
  // The local actor is rebuilt from the stored light viewable: store the moved one first
  const dataStore = useDataStore();
  await dataStore.updateItem(item.data_id, { binary_light_viewable });
  await reloadObject(item.data_id, { rebuildActor: true });
  // Only then the CRS: a basemap built for the new CRS reads the data bounds from the actors,
  // Which must no longer hold the previous coordinates
  await dataStore.updateItem(item.data_id, { crs });
  if (focus) {
    await useHybridViewerStore().focusCameraOnObject(item.data_id);
  }
}

// Each reload rebuilds an actor: one after another, then the camera moves once on the item
async function refreshLinked(linked: (MovedData & { id: DataId })[] | undefined): Promise<void> {
  for (const entry of linked ?? []) {
    // oxlint-disable-next-line no-await-in-loop
    await refresh({ data_id: entry.id }, entry, false);
  }
}

async function convertCrs(
  item: Pick<DataItem, "data_id">,
  crs: CRS,
  { focus = true, linkedItems = [] }: ConvertCrsOptions = {},
): Promise<void> {
  const linkedIds = linkedItems.map(({ data_id }) => data_id);
  const response = await useBackStore().request({
    schema: back_schemas.opengeodeweb_back.crs.convert_geographic,
    params: { id: item.data_id, ...(linkedIds.length > 0 && { linked_ids: linkedIds }), ...crs },
  });
  await refreshLinked(response.linked);
  await refresh(item, response, focus);
}

// Assigning only relabels the coordinates: nothing to reload, the stored CRS follows the back.
// With onlyPlausible, data whose coordinates miss the CRS area are left as they are
async function assignCrs(
  item: Pick<DataItem, "data_id">,
  crs: CRS,
  { linkedItems = [], onlyPlausible = false }: AssignCrsOptions = {},
): Promise<AssignResponse> {
  const linkedIds = linkedItems.map(({ data_id }) => data_id);
  const response = await useBackStore().request({
    schema: back_schemas.opengeodeweb_back.crs.assign_geographic,
    params: {
      id: item.data_id,
      ...(linkedIds.length > 0 && { linked_ids: linkedIds }),
      ...(onlyPlausible && { only_plausible: true }),
      ...crs,
    },
  });
  for (const { id, crs: assigned } of [
    { id: item.data_id, ...response },
    ...(response.linked ?? []),
  ]) {
    if (assigned !== undefined) {
      // oxlint-disable-next-line no-await-in-loop
      await useDataStore().updateItem(id, { crs: assigned });
    }
  }
  return response;
}

async function alignCrs(
  item: DataItem,
  crs: CRS,
  { sourcePoints, targetPoints, linkedItems = [] }: Alignment,
): Promise<void> {
  const linkedIds = linkedItems.map(({ data_id }) => data_id);
  const response = await useBackStore().request({
    schema: back_schemas.opengeodeweb_back.crs.align,
    params: {
      id: item.data_id,
      source_points: sourcePoints,
      target_points: targetPoints,
      ...(linkedIds.length > 0 && { linked_ids: linkedIds }),
      ...crs,
    },
  });
  await refreshLinked(response.linked);
  await refresh(item, response);
}

// One request moves every georeferenced data, from its own CRS: all or nothing.
// Data without CRS are assigned afterwards, by useProjectCrs().adoptProjectCrs.
// The project CRS only changes once the back accepted the conversion
async function changeProjectCrs(crs: CRS): Promise<void> {
  const crsStore = useCrsStore();
  const items = crsStore.crsItems;
  const moved = items.filter((item) => item.crs !== undefined && !sameCrs(item.crs, crs));
  const [first, ...linkedItems] = moved;
  if (first !== undefined) {
    await convertCrs(first, crs, { focus: false, linkedItems });
  }
  crsStore.setProjectCrs(crs);
}

// Data placed in another CRS than the project are converted to it, in one request.
// The project may already have followed them: callers pass the project CRS taken before.
// A refused conversion keeps their CRS and the project one: the warning points to their dialog
async function followProject(
  entries: PlausibleEntry[],
  project: CRS | undefined = useCrsStore().projectCrs,
): Promise<void> {
  const crsStore = useCrsStore();
  if (project === undefined) {
    return;
  }
  const moved = entries.filter((entry) => !sameCrs(entry.crs, project));
  const [first, ...linkedItems] = moved;
  if (first === undefined) {
    return;
  }
  try {
    await convertCrs(first, project, { focus: false, linkedItems });
  } catch {
    crsStore.setProjectCrs(project);
    const names = moved.map(({ name }) => name).join(", ");
    const warning = `Cannot convert ${names} to ${formatCrsCode(project)}. Check its CRS (Assign) or georeference it.`;
    if (moved.length === 1) {
      useFeedbackStore().add_warning(warning, {
        label: "Edit CRS",
        onClick: (): void => {
          crsStore.requestCrsEdit(first.data_id);
        },
      });
    } else {
      useFeedbackStore().add_warning(warning);
    }
  }
}

function useCrs(): UseCrsReturn {
  return { assignCrs, convertCrs, alignCrs, changeProjectCrs, followProject };
}

export type { Alignment, AssignCrsOptions, ConvertCrsOptions, CrsPoint };
export { useCrs };
