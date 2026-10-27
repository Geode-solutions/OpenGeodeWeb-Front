import back_schemas, {
  type CRSList,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";

// Session cache of the available CRS, and the channel the shared components use to ask the host app for a CRS edit
export const useCrsStore = defineStore("crs", () => {
  const backStore = useBackStore();
  // OpenGeode geosciences lists the same geographic CRS for 2D and 3D data: one list for all types
  let geographicListPromise: Promise<CRSList[]> | undefined = undefined;
  const crsEditEnabled = ref(false);
  const crsEditRequest = ref<string | undefined>(undefined);

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

  return {
    geographicList,
    crsEditEnabled,
    enableCrsEdit,
    crsEditRequest,
    requestCrsEdit,
    clearCrsEditRequest,
  };
});
