import type { JsonRpcSchema, RequestHandlers } from "@ogw_shared/utils/types.js";
import { CHUNK_SIZE_BYTES } from "@ogw_shared/utils/file.js";
import type { Microservice } from "./api_fetch.js";
import { consola } from "consola";
import { fetchRaw } from "@ogw_shared/utils/fetch_raw.js";
import { reportError } from "./error_feedback.js";
import { trackRequest } from "./track_request.js";
import { uploadPath } from "@ogw_front/utils/upload_path";

interface UploadFileParams {
  // Always forwarded to fetchRaw via schema.methods, which is only ever set on
  // HTTP-flavored ("front"/"back") schemas.
  schema: JsonRpcSchema & { methods: string[] };
  file: File;
  params?: Record<string, string>;
}

// oxlint-disable-next-line max-lines-per-function
async function upload_file(
  microservice: Microservice,
  { schema, file, params = {} }: UploadFileParams,
  { request_error_function, response_function, response_error_function }: RequestHandlers = {},
): Promise<unknown> {
  consola.debug("[UPLOAD_FILE] Uploading file", { schema, file });

  if (!(file instanceof File)) {
    throw new TypeError("file must be an instance of File");
  }

  const route = schema.$id;
  const method = schema.methods.find((candidate) => candidate !== "OPTIONS");
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE_BYTES));

  function onRequestError(error: unknown): void {
    microservice.stop_request();
    reportError(route, error);
    if (request_error_function) {
      void request_error_function(error);
    }
  }

  function onResponseError(response: unknown): void {
    microservice.stop_request();
    reportError(route, response);
    if (response_error_function) {
      void response_error_function(response);
    }
  }

  async function sendChunks(): Promise<unknown> {
    let lastResponse: unknown = undefined;
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
      const start = chunkIndex * CHUNK_SIZE_BYTES;
      const chunk = file.slice(start, start + CHUNK_SIZE_BYTES);
      const query = new URLSearchParams({
        ...params,
        filename: uploadPath(file),
        chunk_index: String(chunkIndex),
        total_chunks: String(totalChunks),
      });

      // oxlint-disable-next-line no-await-in-loop -- chunks must be sent in order; the server appends each one to the file as it arrives.
      lastResponse = await fetchRaw(
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
    return lastResponse;
  }

  microservice.start_request();
  const followRequest = trackRequest({
    source: microservice.$id,
    kind: "upload",
    route,
    label: file.name,
    params: { filename: uploadPath(file), size: file.size, chunks: totalChunks },
  });
  const result = await followRequest(sendChunks());

  microservice.stop_request();
  if (response_function) {
    response_function(result);
  }
  return result;
}

export { upload_file };
