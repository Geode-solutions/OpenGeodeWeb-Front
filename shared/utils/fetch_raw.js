import _ from "lodash";
import pTimeout from "p-timeout";

function fetchRaw(
  { schema, params = {}, baseURL, headers, max_retry, timeout, expectEvent = false },
  { onRequestError, onResponse, onResponseError } = {},
) {
  const body = params;
  if (expectEvent) { headers["Accept"] = "text/event-stream" }
  const method = schema.methods.find((method) => method !== "OPTIONS");
  const request_options = { method, headers };

  if (!_.isEmpty(body)) { request_options.body = body }
  if (max_retry) { request_options.max_retry = max_retry }

  function doFetch() {
    return $fetch(schema.$id, {
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