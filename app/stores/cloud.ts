import { Status } from "@ogw_front/utils/status";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

// State of the cloud service; launching or reaching it is done by utils/backend_lifecycle.ts
export const useCloudStore = defineStore(
  "cloud",
  () => {
    const status = ref(Status.NOT_CONNECTED);

    function set_connecting(): void {
      status.value = Status.CONNECTING;
    }

    // The status and the server error banner always change together
    function set_connected(connected: boolean): void {
      useFeedbackStore().set_server_error(!connected);
      status.value = connected ? Status.CONNECTED : Status.NOT_CONNECTED;
    }

    return { status, set_connecting, set_connected };
  },
  {
    share: {
      omit: ["status"],
    },
  },
);
