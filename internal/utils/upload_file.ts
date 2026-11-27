import type { HttpJsonRpcSchema, HttpMethod, Microservice } from "./api_fetch.js";
import { CHUNK_SIZE_BYTES } from "@ogw_shared/utils/file.js";
import type { Count } from "@ogw_front/types/ui";
import type { RequestHandlers } from "@ogw_shared/utils/types.js";
import type { Route } from "@ogw_front/types/server";
import { consola } from "consola";
import { fetchRaw } from "@ogw_shared/utils/fetch_raw.js";
import { reportError } from "./error_feedback.js";
import { trackRequest } from "./track_request.js";
import { uploadPath } from "@ogw_front/utils/upload_path";

interface UploadFileParams {
  // Always forwarded to fetchRaw via schema.methods, which is only ever set on
  // HTTP-flavored ("front"/"back") schemas.
  schema: HttpJsonRpcSchema;
  file: File;
  params?: Record<string, string>;
}

interface ChunkUpload {
  microservice: Microservice;
  route: Route;
  method: HttpMethod | undefined;
  file: File;
  params: Record<string, string>;
  totalChunks: Count;
}

// A failed chunk stops the request and is reported before the caller's own handler runs
function chunkErrorHandlers(
  microservice: Microservice,
  route: Route,
  { request_error_function, response_error_function }: RequestHandlers,
): RequestHandlers {
  return {
    request_error_function(error: unknown): void {
      microservice.stop_request();
      reportError(route, error);
      if (request_error_function) {
        void request_error_function(error);
      }
    },
    response_error_function(response: unknown): void {
      microservice.stop_request();
      reportError(route, response);
      if (response_error_function) {
        void response_error_function(response);
      }
    },
  };
}

async function sendChunks(
  { microservice, route, method, file, params, totalChunks }: ChunkUpload,
  handlers: RequestHandlers,
): Promise<unknown> {
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
      handlers,
    );
  }
  return lastResponse;
}

async function upload_file(
  microservice: Microservice,
  { schema, file, params = {} }: UploadFileParams,
  handlers: RequestHandlers = {},
): Promise<unknown> {
  consola.debug("[UPLOAD_FILE] Uploading file", { schema, file });

  if (!(file instanceof File)) {
    throw new TypeError("file must be an instance of File");
  }

  const route = schema.$id;
  const method = schema.methods.find((candidate) => candidate !== "OPTIONS");
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE_BYTES));

  microservice.start_request();
  const followRequest = trackRequest({
    source: microservice.$id,
    kind: "upload",
    route,
    label: file.name,
    params: { filename: uploadPath(file), size: file.size, chunks: totalChunks },
  });
  const result = await followRequest(
    sendChunks(
      { microservice, route, method, file, params, totalChunks },
      chunkErrorHandlers(microservice, route, handlers),
    ),
  );

  microservice.stop_request();
  if (handlers.response_function) {
    handlers.response_function(result);
  }
  return result;
}

export { upload_file };
