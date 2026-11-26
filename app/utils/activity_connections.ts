import { Status } from "@ogw_front/utils/status";
import { useActivityStore } from "@ogw_front/stores/activity";
import { useInfraStore } from "@ogw_front/stores/infra";

// Writes each microservice connection and disconnection to the activity panel
function watchMicroserviceConnections(): void {
  const infraStore = useInfraStore();
  const activityStore = useActivityStore();
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
          activityStore.log({ source, kind: "connection", route: "Connected", status: "info" });
        } else if (previous === Status.CONNECTED) {
          activityStore.log({
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
