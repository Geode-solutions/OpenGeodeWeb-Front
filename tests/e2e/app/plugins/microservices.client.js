import { useGeodeStore } from "@ogw_front/stores/geode";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

export default defineNuxtPlugin(() => {
  const geodeStore = useGeodeStore();
  const infraStore = useInfraStore();
  const viewerStore = useViewerStore();

  infraStore.register_microservice(geodeStore);
  infraStore.register_microservice(viewerStore);
});
