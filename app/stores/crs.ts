import back_schemas, {
  type CRSList,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { oldestCrs, sameCrs } from "@ogw_front/utils/crs";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";

// Session cache of the available CRS, the project CRS, and the channel the shared components use to ask the host app for a CRS edit
// oxlint-disable-next-line max-lines-per-function, max-statements
export const useCrsStore = defineStore("crs", () => {
  const backStore = useBackStore();
  // OpenGeode geosciences lists the same geographic CRS for 2D and 3D data: one list for all types
  let geographicListPromise: Promise<CRSList[]> | undefined = undefined;
  const crsEditEnabled = ref(false);
  const crsEditRequest = ref<string | undefined>(undefined);
  const dataStore = useDataStore();
  const items = dataStore.refAllItems();
  const projectCrs = ref<CRSList | undefined>(undefined);
  const projectCrsEditRequest = ref(false);

  // The first georeferenced data sets the project CRS; then only a project CRS change does
  watch(
    () => oldestCrs(items.value ?? []),
    (crs) => {
      if (projectCrs.value === undefined && crs !== undefined) {
        projectCrs.value = crs;
      }
    },
    { immediate: true },
  );

  // Data without a CRS are not listed: they are not in another CRS, they have none
  const mismatchedCrs = computed(() => {
    const project = projectCrs.value;
    const mismatched = new Map<string, CRSList>();
    for (const item of items.value ?? []) {
      if (project !== undefined && item.crs !== undefined && !sameCrs(item.crs, project)) {
        mismatched.set(item.id, item.crs);
      }
    }
    return mismatched;
  });

  async function fetchGeographicList(geodeObjectType: string): Promise<CRSList[]> {
    try {
      const response = await backStore.request({
        schema: back_schemas.opengeodeweb_back.crs.geographic_list,
        params: { geode_object_type: geodeObjectType },
      });
      if (response?.crs_list !== undefined) {
        return response.crs_list;
      }
    } catch {
      // The back store already reports the error to the user
    }
    // A failed request is not cached: the next call retries
    geographicListPromise = undefined;
    return [];
  }

  async function geographicList(geodeObjectType: string): Promise<CRSList[]> {
    // The promise is cached, so dialogs opened together share a single request.
    // The back still checks each CRS against the list of the data dimension
    geographicListPromise ??= fetchGeographicList(geodeObjectType);
    const list = await geographicListPromise;
    return list;
  }

  function enableCrsEdit(): void {
    crsEditEnabled.value = true;
  }

  function requestCrsEdit(id: string): void {
    crsEditRequest.value = id;
  }

  function clearCrsEditRequest(): void {
    crsEditRequest.value = undefined;
  }

  function setProjectCrs(crs: CRSList): void {
    projectCrs.value = crs;
  }

  function requestProjectCrsEdit(): void {
    projectCrsEditRequest.value = true;
  }

  function clearProjectCrsEditRequest(): void {
    projectCrsEditRequest.value = false;
  }

  // A new project: its data set the project CRS again
  function reset(): void {
    projectCrs.value = undefined;
  }

  function exportStores(): { projectCrs?: CRSList } {
    return { projectCrs: projectCrs.value };
  }

  // Called once the project data is imported: a project saved without it falls back to its oldest data
  function importStores(snapshot: { projectCrs?: CRSList } | undefined): void {
    projectCrs.value = snapshot?.projectCrs ?? oldestCrs(items.value ?? []);
  }

  return {
    geographicList,
    crsEditEnabled,
    enableCrsEdit,
    crsEditRequest,
    requestCrsEdit,
    clearCrsEditRequest,
    projectCrs,
    mismatchedCrs,
    setProjectCrs,
    projectCrsEditRequest,
    requestProjectCrsEdit,
    clearProjectCrsEditRequest,
    reset,
    exportStores,
    importStores,
  };
});
