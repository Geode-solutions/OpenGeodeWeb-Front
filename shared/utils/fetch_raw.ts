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
  headers?: Readonly<Record<string, string>>;
  max_retry?: number;
  timeout?: number;
  expectEvent?: boolean;
}

function resolveHeaders(
  headers: Readonly<Record<string, string>>,
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
  headers: Readonly<Record<string, string>>;
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
}: Readonly<PerformFetchOptions>): Promise<unknown> {
  const fetchResult = await $fetch<unknown>(route, {
    baseURL,
    method,
    headers,
    ...(hasBody(params) ? { body: params } : {}),
    ...(max_retry === undefined ? {} : { retry: max_retry }),
    onRequestError({ error }: Readonly<{ error: unknown }>) {
      if (request_error_function) {
        request_error_function(error);
      }
    },
    onResponse({
      response,
      // oxlint-disable-next-line eslint/id-length -- mirrors the real ofetch/vitest API field name (`ok`/`fn`)
    }: Readonly<{ response: Readonly<{ ok: boolean; _data?: unknown }> }>) {
      if (response.ok && response_function) {
        response_function(response._data);
      }
    },
    onResponseError({ response }: Readonly<{ response: unknown }>) {
      if (response_error_function) {
        response_error_function(response);
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
  }: Readonly<FetchRawOptions>,
  {
    request_error_function,
    response_function,
    response_error_function,
  }: Readonly<RequestHandlers> = {},
): Promise<unknown> {
  const fetchOptions: Readonly<PerformFetchOptions> = {
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
