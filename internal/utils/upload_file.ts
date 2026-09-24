import type { JsonRpcSchema, RequestHandlers } from "@ogw_shared/utils/types.js";
import type { Microservice } from "./api_fetch.js";
import { fetchRaw } from "@ogw_shared/utils/fetch_raw.js";
import { useFeedbackStore } from "@ogw_front/stores/feedback.js";

interface UploadFileParams {
  // Always forwarded to fetchRaw via schema.methods, which is only ever set on
  // HTTP-flavored ("front"/"back") schemas.
  schema: JsonRpcSchema & { methods: string[] };
  file: File;
  params?: Record<string, string | Blob>;
  // When true, the file is sent as the raw request body instead of multipart
  // FormData, with `params`/filename moved into the query string. See
  // OpenGeodeWeb-Back's upload_file route, which supports both request shapes.
  raw?: boolean;
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
  { schema, file, params = {}, raw = false }: UploadFileParams,
  { request_error_function, response_function, response_error_function }: RequestHandlers = {},
): Promise<unknown> {
  console.log("[UPLOAD_FILE] Uploading file", { schema, file });
  const feedbackStore = useFeedbackStore();

  if (!(file instanceof File)) {
    throw new Error("file must be an instance of File");
  }

  let route = schema.$id;
  let body: FormData | File = file;

  if (raw) {
    const queryEntries = Object.entries(params).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    );
    const query = new URLSearchParams([...queryEntries, ["filename", file.name]]);
    route = `${route}?${query.toString()}`;
  } else {
    const formData = new FormData();
    for (const [key, value] of Object.entries(params)) {
      formData.append(key, value);
    }
    formData.append("file", file);
    body = formData;
  }

  microservice.start_request();

  const result = await fetchRaw(
    {
      route,
      method: schema.methods.find((method) => method !== "OPTIONS"),
      params: body,
      baseURL: microservice.base_url,
    },
    {
      request_error_function(error: unknown) {
        microservice.stop_request();
        const typedError = isFetchErrorLike(error) ? error : {};
        feedbackStore.add_error(
          typedError.code ?? 0,
          route,
          typedError.message ?? "",
          typedError.stack ?? "",
        );
        if (request_error_function) {
          request_error_function(error);
        }
      },
      response_function(data: unknown) {
        microservice.stop_request();
        if (response_function) {
          response_function(data);
        }
      },
      response_error_function(response: unknown) {
        microservice.stop_request();
        const typedResponse = isFetchErrorResponseLike(response) ? response : {};
        feedbackStore.add_error(
          typedResponse.status ?? 0,
          route,
          typedResponse.name ?? "",
          typedResponse.description ?? "",
        );
        if (response_error_function) {
          response_error_function(response);
        }
      },
    },
  );
  return result;
}

export { upload_file };
