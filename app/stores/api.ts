import { useHttpTransport, useRequestCounter } from "@ogw_internal/stores/microservice";

export const useAPIStore = defineStore("api", () => {
  const base_url = ref(useRuntimeConfig().public.CLOUD_API_URL);
  const counter = useRequestCounter();
  const { request_counter, is_busy, start_request, stop_request } = counter;
  const { request } = useHttpTransport("api", base_url, counter);

  return {
    base_url,
    request_counter,
    is_busy,
    request,
    start_request,
    stop_request,
  };
});
