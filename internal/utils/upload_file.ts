import type { JsonRpcSchema, RequestHandlers } from "@ogw_shared/utils/types.js";
import { CHUNK_SIZE_BYTES } from "@ogw_shared/utils/file.js";
import type { Microservice } from "./api_fetch.js";
import { fetchRaw } from "@ogw_shared/utils/fetch_raw.js";
import { useFeedbackStore } from "@ogw_front/stores/feedback.js";

interface UploadFileParams {
  // Always forwarded to fetchRaw via schema.methods, which is only ever set on
  // HTTP-flavored ("front"/"back") schemas.
  schema: JsonRpcSchema & { methods: string[] };
  file: File;
  params?: Record<string, string>;
}

// Loosely-typed shapes for the dynamic error/response values reported by fetchRaw.
interface FetchErrorLike {
  code?: number;
  message?: string;
  stack?: string;
}

interface FetchErrorResponseLike {
  status?: number;
  name?: string;
  description?: string;
}

function isFetchErrorLike(value: unknown): value is FetchErrorLike {
  return typeof value === "object" && value !== null;
}

function isFetchErrorResponseLike(value: unknown): value is FetchErrorResponseLike {
  return typeof value === "object" && value !== null;
}

async function upload_file(
  microservice: Microservice,
  { schema, file, params = {} }: UploadFileParams,
  { request_error_function, response_function, response_error_function }: RequestHandlers = {},
): Promise<unknown> {
  console.log("[UPLOAD_FILE] Uploading file", { schema, file });
  const feedbackStore = useFeedbackStore();

  if (!(file instanceof File)) {
    throw new Error("file must be an instance of File");
  }

  const route = schema.$id;
  const method = schema.methods.find((candidate) => candidate !== "OPTIONS");
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE_BYTES));

  function onRequestError(error: unknown): void {
    microservice.stop_request();
    const typedError = isFetchErrorLike(error) ? error : {};
    feedbackStore.add_error(
      typedError.code ?? 0,
      route,
      typedError.message ?? "",
      typedError.stack ?? "",
    );
    if (request_error_function) {
      void request_error_function(error);
    }
  }

  function onResponseError(response: unknown): void {
    microservice.stop_request();
    const typedResponse = isFetchErrorResponseLike(response) ? response : {};
    feedbackStore.add_error(
      typedResponse.status ?? 0,
      route,
      typedResponse.name ?? "",
      typedResponse.description ?? "",
    );
    if (response_error_function) {
      void response_error_function(response);
    }
  }

  microservice.start_request();

  let result: unknown = undefined;
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
    const start = chunkIndex * CHUNK_SIZE_BYTES;
    const chunk = file.slice(start, start + CHUNK_SIZE_BYTES);
    const query = new URLSearchParams({
      ...params,
      filename: file.name,
      chunk_index: String(chunkIndex),
      total_chunks: String(totalChunks),
    });

    // oxlint-disable-next-line no-await-in-loop -- chunks must be sent in order; the server appends each one to the file as it arrives.
    result = await fetchRaw(
      {
        route: `${route}?${query.toString()}`,
        method,
        params: chunk,
        baseURL: microservice.base_url,
      },
      {
        request_error_function: onRequestError,
        response_error_function: onResponseError,
      },
    );
  }

  microservice.stop_request();
  if (response_function) {
    response_function(result);
  }
  return result;
}

export { upload_file };
