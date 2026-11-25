import type { CRS } from "@geode/opengeodeweb-back/schema_types";
import { oldestCrs } from "@ogw_front/utils/crs";
import { useCrsRequests } from "./crs_helpers/requests.js";
import { useDataStore } from "@ogw_front/stores/data";
import { useGeographicList } from "./crs_helpers/geographic_list.js";
import { useProjectCrsState } from "./crs_helpers/project_crs.js";

// Session cache of the available CRS, the project CRS, and the channel the shared components use to ask the host app for a CRS edit
export const useCrsStore = defineStore("crs", () => {
  const crsItems = useDataStore().refCrsItems();
  const { geographicList } = useGeographicList();
  const { projectCrs, mismatchedCrs, setProjectCrs } = useProjectCrsState(crsItems);
  // Edit and alignment requests, returned as they are
  const requests = useCrsRequests();

  // A new project: its data set the project CRS again
  function reset(): void {
    projectCrs.value = undefined;
    requests.closeCrsAlign();
  }

  function exportStores(): { projectCrs?: CRS } {
    return { projectCrs: projectCrs.value };
  }

  // Called once the project data is imported: a project saved without it falls back to its oldest data
  function importStores(snapshot: { projectCrs?: CRS } | undefined): void {
    projectCrs.value = snapshot?.projectCrs ?? oldestCrs(crsItems.value);
  }

  return {
    crsItems,
    geographicList,
    projectCrs,
    mismatchedCrs,
    setProjectCrs,
    ...requests,
    reset,
    exportStores,
    importStores,
  };
});
