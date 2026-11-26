import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";
import type {
  JsonRpcSchema,
  MicroserviceVersionSchema,
  ParamsOf,
  RequestHandlers,
  ResponseOf,
} from "@ogw_shared/utils/types.js";
import { type Microservice, api_fetch } from "@ogw_internal/utils/api_fetch";
import { upload_file } from "@ogw_internal/utils/upload_file.js";

// The pieces every microservice store is made of: a busy counter, an HTTP transport,
// A ping loop and a version. Each store composes the ones it needs.

const MILLISECONDS_IN_SECOND = 1000;
const DEFAULT_PING_INTERVAL_SECONDS = 10;
const DEFAULT_VERSION = "0.0.0";

interface RequestCounter {
  request_counter: Ref<number>;
  is_busy: ComputedRef<boolean>;
  start_request: () => void;
  stop_request: () => void;
}

type HttpRequestCallbacks<Response> = RequestHandlers<Response> & {
  readonly skip_feedback_error?: boolean;
  readonly timeout?: number;
};

interface HttpRequestArgs<Schema extends JsonRpcSchema> {
  schema: Schema;
  params?: ParamsOf<Schema>;
  headers?: Record<string, string>;
  log_success?: boolean;
}

type HttpRequest = <Schema extends JsonRpcSchema>(
  args: HttpRequestArgs<Schema>,
  callbacks?: HttpRequestCallbacks<ResponseOf<Schema>>,
) => Promise<ResponseOf<Schema>>;

interface HttpUploadArgs {
  schema: JsonRpcSchema;
  file: File;
  params?: Record<string, string>;
}

// What a transport needs of the counter: it only reports when a request starts and stops
type RequestTracker = Pick<RequestCounter, "start_request" | "stop_request">;

interface HttpTransport {
  request: HttpRequest;
  upload: (args: HttpUploadArgs, callbacks?: RequestHandlers) => Promise<unknown>;
}

type VersionRequest = (
  args: { schema: MicroserviceVersionSchema },
  callbacks: RequestHandlers<{ microservice_version: string }>,
) => Promise<{ microservice_version: string }>;

// HTTP schemas ("front"/"back"/"cloud") always carry `methods`; the shared JsonRpcSchema
// Type keeps it optional because websocket ("viewer") schemas have `rpc` instead.
function asHttpSchema(schema: JsonRpcSchema): JsonRpcSchema & { methods: string[] } {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- see comment above.
  return schema as JsonRpcSchema & { methods: string[] };
}

function useRequestCounter(): RequestCounter {
  const request_counter = ref(0);
  const is_busy = computed(() => request_counter.value > 0);

  function start_request(): void {
    request_counter.value += 1;
  }

  function stop_request(): void {
    request_counter.value -= 1;
  }

  return { request_counter, is_busy, start_request, stop_request };
}

// `base_url` is read on each request: pass the store's ref, not a copy of its value
function useHttpTransport(
  id: string,
  base_url: MaybeRefOrGetter<string>,
  { start_request, stop_request }: RequestTracker,
): HttpTransport {
  function microservice(): Microservice {
    return { $id: id, base_url: toValue(base_url), start_request, stop_request };
  }

  async function request<Schema extends JsonRpcSchema>(
    { schema, params, headers = {}, log_success }: HttpRequestArgs<Schema>,
    callbacks: HttpRequestCallbacks<ResponseOf<Schema>> = {},
  ): Promise<ResponseOf<Schema>> {
    const { response_function } = callbacks;
    const result = await api_fetch(
      microservice(),
      {
        schema: asHttpSchema(schema),
        params: params ?? {},
        headers,
        ...(log_success !== undefined && { log_success }),
      },
      {
        ...callbacks,
        response_function: async (response: unknown) => {
          if (response_function) {
            // The microservices validate their responses against the schema `response` the
            // Typed schemas are generated from: this is the trusted API boundary.
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            await response_function(response as ResponseOf<Schema>);
          }
        },
      },
    );
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- same trusted boundary as above.
    return result as ResponseOf<Schema>;
  }

  async function upload(
    { schema, file, params }: HttpUploadArgs,
    callbacks: RequestHandlers = {},
  ): Promise<unknown> {
    const result = await upload_file(
      microservice(),
      { schema: asHttpSchema(schema), file, params },
      callbacks,
    );
    return result;
  }

  return { request, upload };
}

// Calling start again restarts the loop: there is never more than one timer
function usePing(
  ping: () => Promise<unknown>,
  interval_milliseconds = DEFAULT_PING_INTERVAL_SECONDS * MILLISECONDS_IN_SECOND,
): { start_ping: () => void; stop_ping: () => void } {
  let timer: ReturnType<typeof setInterval> | undefined = undefined;

  function stop_ping(): void {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  }

  function start_ping(): void {
    stop_ping();
    void ping();
    timer = setInterval(() => {
      void ping();
    }, interval_milliseconds);
  }

  return { start_ping, stop_ping };
}

function useMicroserviceVersion(request: VersionRequest): {
  version: Ref<string>;
  get_version: (
    schema: MicroserviceVersionSchema | undefined,
  ) => Promise<{ microservice_version: string } | undefined>;
} {
  const version = ref(DEFAULT_VERSION);

  async function get_version(
    schema: MicroserviceVersionSchema | undefined,
  ): Promise<{ microservice_version: string } | undefined> {
    if (!schema) {
      return undefined;
    }
    const result = await request(
      { schema },
      {
        response_function: ({ microservice_version }) => {
          version.value = microservice_version;
        },
      },
    );
    return result;
  }

  return { version, get_version };
}

export { useHttpTransport, useMicroserviceVersion, usePing, useRequestCounter };
export type { HttpRequest, HttpRequestCallbacks, HttpTransport, RequestCounter, RequestTracker };
