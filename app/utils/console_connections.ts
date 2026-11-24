import { Status } from "@ogw_front/utils/status";
import { useConsoleStore } from "@ogw_front/stores/console";
import { useInfraStore } from "@ogw_front/stores/infra";

// Writes each microservice connection and disconnection to the console
function watchMicroserviceConnections(): void {
  const infraStore = useInfraStore();
  const consoleStore = useConsoleStore();
  const known = new Map<string, string | undefined>();

  watch(
    () => infraStore.microservices.map((store) => [store.$id, store.status] as const),
    (statuses) => {
      for (const [source, status] of statuses) {
        const previous = known.get(source);
        known.set(source, status);
        if (status === previous) {
          continue;
        }
        if (status === Status.CONNECTED) {
          consoleStore.log({ source, kind: "connection", route: "Connected", status: "info" });
        } else if (previous === Status.CONNECTED) {
          consoleStore.log({
            source,
            kind: "connection",
            route: "Connection lost",
            status: "error",
          });
        }
      }
    },
    { immediate: true },
  );
}

export { watchMicroserviceConnections };
