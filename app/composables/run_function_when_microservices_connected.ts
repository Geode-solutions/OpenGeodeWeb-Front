import { useInfraStore } from "@ogw_front/stores/infra";

export function runFunctionWhenMicroservicesConnected(functionToRun: () => void): void {
  const infraStore = useInfraStore();
  const { microservices_connected } = storeToRefs(infraStore);
  if (microservices_connected.value) {
    functionToRun();
  }
  watch(
    microservices_connected,
    (value) => {
      if (value) {
        functionToRun();
      }
    },
    { once: true },
  );
}
