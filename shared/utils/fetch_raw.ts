// Third party imports
import { $fetch } from "ofetch";
import _ from "lodash";
import pTimeout from "p-timeout";

// Local imports
import { hasBody } from "./file.js";
import type { RequestHandlers } from "./types.js";

interface FetchRawOptions {
  route: string;
  method?: string;
  params?: unknown;
  baseURL?: string;
  headers?: Record<string, string>;
  max_retry?: number;
  timeout?: number;
  expectEvent?: boolean;
}

function fetchRaw(
  {
    route,
    method,
    params = {},
    baseURL,
    headers = {},
    max_retry,
    timeout,
    expectEvent = false,
  }: FetchRawOptions,
  { request_error_function, response_function, response_error_function }: RequestHandlers = {},
) {
  if (expectEvent) {
    const value = "text/event-stream";
    if (_.isEmpty(headers)) {
      headers["Accept"] = value;
    } else {
      headers["Accept"] = `${headers["Accept"]}, ${value}`;
    }
  }

  const request_options: Record<string, unknown> = { method, headers };
  if (hasBody(params)) {
    request_options.body = params;
  }
  if (max_retry) {
    request_options.max_retry = max_retry;
  }

  function doFetch() {
    return $fetch(route, {
      baseURL,
      ...request_options,
      onRequestError({ error }: { error: unknown }) {
        if (request_error_function) {
          request_error_function(error);
        }
      },
      onResponse({ response }: { response: { ok: boolean; _data: unknown } }) {
        if (response.ok && response_function) {
          response_function(response._data);
        }
      },
      onResponseError({ response }: { response: unknown }) {
        if (response_error_function) {
          response_error_function(response);
        }
      },
    } as Parameters<typeof $fetch>[1]);
  }

  if (timeout && timeout > 0) {
    return pTimeout(doFetch(), {
      milliseconds: timeout,
      message: `${route}: Timed out after ${timeout}ms`,
    });
  }
  return doFetch();
}

export { fetchRaw };
