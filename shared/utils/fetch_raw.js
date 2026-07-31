import { hasBody } from "./file.js";
import pTimeout from "p-timeout";

function fetchRaw(
  { route, method, params = {}, baseURL, headers = {}, max_retry, timeout, expectEvent = false },
  { onRequestError, onResponse, onResponseError } = {},
) {
  if (expectEvent) { headers["Accept"] = "text/event-stream" }

  const request_options = { method, headers };
  if (hasBody(params)) { request_options.body = params }
  if (max_retry) { request_options.max_retry = max_retry }

  function doFetch() {
    return $fetch(route, {
      baseURL,
      ...request_options,
      onRequestError({ error }) {
        if (onRequestError) {
          onRequestError(error);
        }
      },
      onResponse({ response }) {
        if (response.ok && onResponse) {
          onResponse(response._data);
        }
      },
      onResponseError({ response }) {
        if (onResponseError) {
          onResponseError(response);
        }
      },
    });
  }

  if (timeout > 0) {
    return pTimeout(doFetch(), {
      milliseconds: timeout,
      message: `${route}: Timed out after ${timeout}ms`,
    });
  }
  return doFetch();
}

export { fetchRaw };