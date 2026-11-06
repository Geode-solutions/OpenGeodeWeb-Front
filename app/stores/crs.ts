import type { DataId, GeodeObjectType } from "@ogw_front/types/identifiers";
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
  const crsItems = dataStore.refCrsItems();
  const projectCrs = ref<CRSList | undefined>(undefined);
  const projectCrsEditRequest = ref(false);

  // The project follows its data: once every georeferenced data is in one CRS, it is the project
  // CRS. Data already mixed before any project CRS: the oldest one is the reference
  watch(
    () => {
      const georeferenced = crsItems.value.filter((item) => item.crs !== undefined);
      const [first] = georeferenced;
      if (first === undefined) {
        return undefined;
      }
      if (georeferenced.every((item) => sameCrs(item.crs, first.crs))) {
        return first.crs;
      }
      return projectCrs.value ?? oldestCrs(georeferenced);
    },
    (reference) => {
      if (reference !== undefined && !sameCrs(reference, projectCrs.value)) {
        projectCrs.value = reference;
      }
    },
    { immediate: true },
  );

  // Data without CRS are listed too (value undefined): they could not follow the project
  const mismatchedCrs = computed(() => {
    const project = projectCrs.value;
    const mismatched = new Map<string, CRSList | undefined>();
    for (const item of crsItems.value) {
      if (project !== undefined && !sameCrs(item.crs, project)) {
        mismatched.set(item.data_id, item.crs);
      }
    }
    return mismatched;
  });

  async function fetchGeographicList(geodeObjectType: GeodeObjectType): Promise<CRSList[]> {
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

  async function geographicList(geodeObjectType: GeodeObjectType): Promise<CRSList[]> {
    // The promise is cached, so dialogs opened together share a single request.
    // The back still checks each CRS against the list of the data dimension
    geographicListPromise ??= fetchGeographicList(geodeObjectType);
    const list = await geographicListPromise;
    return list;
  }

  function enableCrsEdit(): void {
    crsEditEnabled.value = true;
  }

  function requestCrsEdit(dataId: DataId): void {
    crsEditRequest.value = dataId;
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
    projectCrs.value = snapshot?.projectCrs ?? oldestCrs(crsItems.value);
  }

  return {
    crsItems,
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
