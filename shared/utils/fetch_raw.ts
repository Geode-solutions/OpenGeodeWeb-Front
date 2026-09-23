// Third party imports
import { $fetch } from "ofetch";
import _ from "lodash";
import pTimeout from "p-timeout";

// Local imports
import type { RequestHandlers } from "./types.js";
import { hasBody } from "./file.js";

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

function resolveHeaders(
  headers: Record<string, string>,
  expectEvent: boolean,
): Record<string, string> {
  const resolvedHeaders: Record<string, string> = { ...headers };
  if (expectEvent) {
    const value = "text/event-stream";
    if (_.isEmpty(resolvedHeaders)) {
      resolvedHeaders.Accept = value;
    } else {
      resolvedHeaders.Accept = `${resolvedHeaders.Accept}, ${value}`;
    }
  }
  return resolvedHeaders;
}

interface PerformFetchOptions extends RequestHandlers {
  route: string;
  method?: string;
  params?: unknown;
  baseURL?: string;
  headers: Record<string, string>;
  max_retry?: number;
}

async function performFetch({
  route,
  method,
  params,
  baseURL,
  headers,
  max_retry,
  request_error_function,
  response_function,
  response_error_function,
}: PerformFetchOptions): Promise<unknown> {
  const fetchResult = await $fetch<unknown>(route, {
    baseURL,
    method,
    headers,
    ...(hasBody(params) ? { body: params } : {}),
    ...(max_retry === undefined ? {} : { retry: max_retry }),
    async onRequestError({ error }: { error: unknown }) {
      if (request_error_function) {
        await request_error_function(error);
      }
    },
    async onResponse({
      response,
      // oxlint-disable-next-line eslint/id-length -- mirrors the real ofetch/vitest API field name (`ok`/`fn`)
    }: {
      response: { ok: boolean; _data?: unknown };
    }) {
      if (response.ok && response_function) {
        // Ofetch awaits whatever this hook returns; without awaiting here, callers relying on
        // An async response_function (e.g. store patches) race the resolution of this $fetch call.
        await response_function(response._data);
      }
    },
    async onResponseError({ response }: { response: unknown }) {
      if (response_error_function) {
        await response_error_function(response);
      }
    },
  });
  return fetchResult;
}

async function fetchRaw(
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
): Promise<unknown> {
  const fetchOptions: PerformFetchOptions = {
    route,
    method,
    params,
    baseURL,
    headers: resolveHeaders(headers, expectEvent),
    max_retry,
    request_error_function,
    response_function,
    response_error_function,
  };

  if (timeout !== undefined && timeout > 0) {
    const result = await pTimeout(performFetch(fetchOptions), {
      milliseconds: timeout,
      message: `${route}: Timed out after ${timeout}ms`,
    });
    return result;
  }
  const result = await performFetch(fetchOptions);
  return result;
}

export { fetchRaw };
