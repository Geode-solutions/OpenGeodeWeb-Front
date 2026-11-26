import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { DataItem } from "@ogw_front/stores/data";
import type { Ref } from "vue";

interface CrsRequests {
  crsEditEnabled: Ref<boolean>;
  enableCrsEdit: () => void;
  crsEditRequest: Ref<string | undefined>;
  requestCrsEdit: (dataId: DataId) => void;
  clearCrsEditRequest: () => void;
  projectCrsEditRequest: Ref<boolean>;
  requestProjectCrsEdit: () => void;
  clearProjectCrsEditRequest: () => void;
  showCrsAlign: Ref<boolean>;
  crsAlignItem: Ref<DataItem | undefined>;
  openCrsAlign: (item: DataItem) => void;
  closeCrsAlign: () => void;
}

// The channel the shared components use to ask the host app for a CRS edit or an alignment
function useCrsRequests(): CrsRequests {
  const crsEditEnabled = ref(false);
  const crsEditRequest = ref<string | undefined>(undefined);
  const projectCrsEditRequest = ref(false);
  const showCrsAlign = ref(false);
  const crsAlignItem = ref<DataItem | undefined>(undefined);

  return {
    crsEditEnabled,
    enableCrsEdit: (): void => {
      crsEditEnabled.value = true;
    },
    crsEditRequest,
    requestCrsEdit: (dataId: DataId): void => {
      crsEditRequest.value = dataId;
    },
    clearCrsEditRequest: (): void => {
      crsEditRequest.value = undefined;
    },
    projectCrsEditRequest,
    requestProjectCrsEdit: (): void => {
      projectCrsEditRequest.value = true;
    },
    clearProjectCrsEditRequest: (): void => {
      projectCrsEditRequest.value = false;
    },
    showCrsAlign,
    crsAlignItem,
    openCrsAlign: (item: DataItem): void => {
      crsAlignItem.value = item;
      showCrsAlign.value = true;
    },
    closeCrsAlign: (): void => {
      showCrsAlign.value = false;
      crsAlignItem.value = undefined;
    },
  };
}

export { useCrsRequests };
