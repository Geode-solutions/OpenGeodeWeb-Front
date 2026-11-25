import type { CRS } from "@geode/opengeodeweb-back/schema_types";
import type { GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";

interface GeographicList {
  geographicList: (geodeObjectType: GeodeObjectType) => Promise<CRS[]>;
}

// Session cache of the available CRS
function useGeographicList(): GeographicList {
  const backStore = useBackStore();
  // OpenGeode geosciences lists the same geographic CRS for 2D and 3D data: one list for all types
  let geographicListPromise: Promise<CRS[]> | undefined = undefined;

  async function fetchGeographicList(geodeObjectType: GeodeObjectType): Promise<CRS[]> {
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

  async function geographicList(geodeObjectType: GeodeObjectType): Promise<CRS[]> {
    // The promise is cached, so dialogs opened together share a single request.
    // The back still checks each CRS against the list of the data dimension
    geographicListPromise ??= fetchGeographicList(geodeObjectType);
    const list = await geographicListPromise;
    return list;
  }

  return { geographicList };
}

export { useGeographicList };
