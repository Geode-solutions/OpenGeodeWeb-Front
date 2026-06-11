import { useInfraStore } from "@ogw_front/stores/infra";

export function runFunctionWhenMicroservicesConnected(functionToRun) {
  const infraStore = useInfraStore();
  const { microservices_connected } = storeToRefs(infraStore);
  console.log("inside microservices_connected", microservices_connected.value);
  if (microservices_connected.value) {
    functionToRun();
  }
  watch(microservices_connected, (value) => {
    if (value) {
      console.log("watch microservices_connected", value);
      functionToRun();
    }
  }, { once: true });

}
