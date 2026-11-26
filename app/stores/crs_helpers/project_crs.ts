import type { ComputedRef, Ref } from "vue";
import { oldestCrs, sameCrs } from "@ogw_front/utils/crs";
import type { CRS } from "@geode/opengeodeweb-back/schema_types";
import type { CrsItem } from "@ogw_front/stores/data";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";

interface ProjectCrsState {
  projectCrs: Ref<CRS | undefined>;
  mismatchedCrs: ComputedRef<Map<DataId, CRS | undefined>>;
  setProjectCrs: (crs: CRS) => void;
}

// The CRS every data of the project should be in, given the data CRS
function referenceCrs(crsItems: CrsItem[], projectCrs: CRS | undefined): CRS | undefined {
  const georeferenced = crsItems.filter((item) => item.crs !== undefined);
  const [first] = georeferenced;
  if (first === undefined) {
    return undefined;
  }
  if (georeferenced.every((item) => sameCrs(item.crs, first.crs))) {
    return first.crs;
  }
  return projectCrs ?? oldestCrs(georeferenced);
}

// The project CRS and the data out of it
function useProjectCrsState(crsItems: Ref<CrsItem[]>): ProjectCrsState {
  const projectCrs = ref<CRS | undefined>(undefined);

  // The project follows its data: once every georeferenced data is in one CRS, it is the project
  // CRS. Data already mixed before any project CRS: the oldest one is the reference
  watch(
    () => referenceCrs(crsItems.value, projectCrs.value),
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
    const mismatched = new Map<DataId, CRS | undefined>();
    for (const item of crsItems.value) {
      if (project !== undefined && !sameCrs(item.crs, project)) {
        mismatched.set(item.data_id, item.crs);
      }
    }
    return mismatched;
  });

  function setProjectCrs(crs: CRS): void {
    projectCrs.value = crs;
  }

  return { projectCrs, mismatchedCrs, setProjectCrs };
}

export { useProjectCrsState };
