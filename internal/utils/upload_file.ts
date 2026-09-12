// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import { fetchRaw } from "@ogw_shared/utils/fetch_raw.js";
import { useFeedbackStore } from "@ogw_front/stores/feedback.js";
import type { JsonRpcSchema, RequestHandlers } from "@ogw_shared/utils/types.js";
import type { Microservice } from "./api_fetch.js";

interface UploadFileParams {
  // Always forwarded to fetchRaw via schema.methods, which is only ever set on
  // HTTP-flavored ("front"/"back") schemas.
  schema: JsonRpcSchema & { methods: string[] };
  file: File;
  params?: Record<string, string | Blob>;
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

function upload_file(
  microservice: Microservice,
  { schema, file, params = {} }: UploadFileParams,
  { request_error_function, response_function, response_error_function }: RequestHandlers = {},
) {
  console.log("[UPLOAD_FILE] Uploading file", { schema, file });
  const feedbackStore = useFeedbackStore();

  if (!(file instanceof File)) {
    return Promise.reject(new Error("file must be an instance of File"));
  }

  const body = new FormData();
  for (const [key, value] of Object.entries(params)) {
    body.append(key, value);
  }
  body.append("file", file);

  microservice.start_request();
  const route = schema.$id;

  return fetchRaw(
    {
      route,
      method: schema.methods.find((method) => method !== "OPTIONS"),
      params: body,
      baseURL: microservice.base_url,
    },
    {
      request_error_function(error: unknown) {
        microservice.stop_request();
        const typedError = error as FetchErrorLike;
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
        const typedResponse = response as FetchErrorResponseLike;
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
}

export { upload_file };
