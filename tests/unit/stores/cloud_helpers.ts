// Third party imports
import type { FetchContext, FetchResponse } from "ofetch";

// CONSTANTS
const PROJECT = "project";
const BRANCH = "branch";
const CLOUD_API_URL = "https://api.example.com";
const TOKEN = "token";
const RESPONSE_OK_STATUS = 200;
const RESPONSE_ERROR_STATUS = 500;
const CLOUD_RUN_HOST = "vease-abc123.europe-west1.run.app";

function setCloudUrlParam(value?: string): void {
  const search = value === undefined ? "" : `?cloud_url=${encodeURIComponent(value)}`;
  globalThis.history.replaceState(undefined, "", `/${search}`);
}

function setupConfig(): void {
  const config = useRuntimeConfig();
  config.public.PROJECT = PROJECT;
  config.public.BRANCH = BRANCH;
  config.public.CLOUD_API_URL = CLOUD_API_URL;
}

// Normalizes ofetch's `MaybeArray<Hook>` option fields (a single hook or an array of hooks)
// Into a plain array, so tests can invoke every registered hook the same way.
function toHookArray<Hook>(hooks: Hook | Hook[] | undefined): Hook[] {
  if (Array.isArray(hooks)) {
    return hooks;
  }
  return hooks === undefined ? [] : [hooks];
}

// Builds a minimal, real `FetchResponse` (a `Response` with an attached `_data`) so
// Hook callbacks receive an object that genuinely satisfies ofetch's response type.
function buildFetchResponse<ResponseData>(
  responseData: ResponseData,
  status: number,
): FetchResponse<ResponseData> {
  const response: FetchResponse<ResponseData> = Response.json(responseData, {
    status,
  });
  response._data = responseData;
  return response;
}

// Builds a minimal, real `FetchContext` (plus the response) to hand to `onResponse`/
// `onResponseError` hooks, satisfying ofetch's hook signature without any unsafe cast.
function buildFetchContext<ResponseData>(
  responseData: ResponseData,
  status: number,
): FetchContext & { response: FetchResponse<ResponseData> } {
  return {
    request: "test.com",
    options: { headers: new Headers() },
    response: buildFetchResponse(responseData, status),
  };
}

export {
  PROJECT,
  BRANCH,
  CLOUD_API_URL,
  TOKEN,
  RESPONSE_OK_STATUS,
  RESPONSE_ERROR_STATUS,
  CLOUD_RUN_HOST,
  setCloudUrlParam,
  setupConfig,
  toHookArray,
  buildFetchContext,
};
