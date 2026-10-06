import type { ParamsOf, RequestHandlers, ResponseOf } from "@ogw_shared/utils/types";
import { api_fetch } from "@ogw_internal/utils/api_fetch";
import { consola } from "consola";

interface ApiSchema {
  $id: string;
  methods: string[];
  [key: string]: unknown;
}

type ApiCallbacks<Response = unknown> = RequestHandlers<Response> & {
  skip_feedback_error?: boolean;
};

const MILLISECONDS_IN_SECOND = 1000;

export const useAPIStore = defineStore("api", () => {
  const request_counter = ref(0);
  const base_url = ref(useRuntimeConfig().public.CLOUD_API_URL);

  function start_request(): void {
    request_counter.value += 1;
  }

  function stop_request(): void {
    request_counter.value -= 1;
  }

  // The response type comes from the schema's generated `response` type (see the Cloud API typed schemas), asserted at the API boundary below, not verified
  async function request<Schema extends ApiSchema>(
    {
      schema,
      params,
      headers = {},
    }: { schema: Schema; params?: ParamsOf<Schema>; headers?: Record<string, string> },
    callbacks: ApiCallbacks<ResponseOf<Schema>> = {},
  ): Promise<ResponseOf<Schema>> {
    consola.info("[API] Request:", schema.$id);
    const start = Date.now();

    const result = await api_fetch(
      { $id: schema.$id, base_url: base_url.value, start_request, stop_request },
      { schema, params: params ?? {}, headers },
      {
        ...callbacks,
        response_function: async (response: unknown) => {
          consola.info(
            "[API] Request completed:",
            schema.$id,
            "in",
            (Date.now() - start) / MILLISECONDS_IN_SECOND,
            "s",
          );
          if (callbacks.response_function) {
            // oxlint-disable-next-line no-unsafe-type-assertion -- trusted API boundary; see comment above.
            await callbacks.response_function(response as ResponseOf<Schema>);
          }
        },
      },
    );
    // oxlint-disable-next-line no-unsafe-type-assertion -- trusted API boundary; see comment above.
    return result as ResponseOf<Schema>;
  }
  return {
    base_url,
    request,
    start_request,
    stop_request,
  };
});
