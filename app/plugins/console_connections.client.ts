import { watchMicroserviceConnections } from "@ogw_front/utils/console_connections";

export default defineNuxtPlugin({
  name: "console-connections",
  dependsOn: ["pinia"],
  setup() {
    watchMicroserviceConnections();
  },
});
