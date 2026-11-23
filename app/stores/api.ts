import { useHttpTransport } from "@ogw_internal/stores/microservice";

export const useAPIStore = defineStore("api", () => {
  const base_url = ref(useRuntimeConfig().public.CLOUD_API_URL);
  const { request, request_counter, is_busy, start_request, stop_request } = useHttpTransport(
    "api",
    base_url,
  );

  return {
    base_url,
    request_counter,
    is_busy,
    request,
    start_request,
    stop_request,
  };
});
