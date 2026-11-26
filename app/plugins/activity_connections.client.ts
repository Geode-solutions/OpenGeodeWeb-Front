import { watchMicroserviceConnections } from "@ogw_front/utils/activity_connections";

export default defineNuxtPlugin({
  name: "activity-connections",
  dependsOn: ["pinia"],
  setup() {
    watchMicroserviceConnections();
  },
});
