import { useBackStore } from "@ogw_front/stores/back";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

// oxlint-disable-next-line import/no-default-export
export default defineNuxtPlugin(() => {
  const infraStore = useInfraStore();
  infraStore.register_microservice(useBackStore());
  infraStore.register_microservice(useViewerStore());
});
