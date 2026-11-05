import { type Extent, boxesExtent } from "./extent.js";
import type { ComputedRef } from "vue";
import { sameCrs } from "@ogw_front/utils/crs";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Georeferenced {
  // A map needs at least one data in the project CRS to lie under
  available: ComputedRef<boolean>;
  georeferencedIds: () => string[];
  dataBounds: () => Extent | undefined;
  // Changes with the project CRS, the georeferenced data or their extent
  dataKey: () => string;
}

// Data without a CRS is still in local coordinates, and data in another CRS than the
// Project would be misplaced: only the data in the project CRS are under the basemap
function useGeoreferenced(): Georeferenced {
  const crsStore = useCrsStore();
  const hybridViewerStore = useHybridViewerStore();

  function georeferencedIds(): string[] {
    return crsStore.crsItems
      .filter((item) => sameCrs(item.crs, crsStore.projectCrs))
      .map((item) => item.id);
  }

  const available = computed(
    () => crsStore.projectCrs !== undefined && georeferencedIds().length > 0,
  );

  function dataBounds(): Extent | undefined {
    const georeferenced = new Set(georeferencedIds());
    return boxesExtent(
      Object.entries(hybridViewerStore.hybridDb)
        .filter(([id]) => georeferenced.has(id))
        .map(([, entry]) => entry.polydata.getBounds()),
    );
  }

  function dataKey(): string {
    const crs = crsStore.projectCrs;
    const extentKey = JSON.stringify(dataBounds() ?? "none");
    return `${crs?.authority}:${crs?.code}|${georeferencedIds().join(",")}|${extentKey}`;
  }

  return { available, georeferencedIds, dataBounds, dataKey };
}

export { useGeoreferenced };
