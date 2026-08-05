// Third party imports
import { $fetch } from "ofetch";
import _ from "lodash";
import pTimeout from "p-timeout";

// Local imports
import { hasBody } from "./file.js";

function fetchRaw(
  { route, method, params = {}, baseURL, headers = {}, max_retry, timeout, expectEvent = false },
  { request_error_function, response_function, response_error_function } = {},
) {
  if (expectEvent) {
    const value = "text/event-stream";
    if (_.isEmpty(headers)) {
      headers["Accept"] = value;
    } else {
      headers["Accept"] = `${headers["Accept"]}, ${value}`;
    }
  }

  const request_options = { method, headers };
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
      onRequestError({ error }) {
        if (request_error_function) {
          request_error_function(error);
        }
      },
      onResponse({ response }) {
        if (response.ok && response_function) {
          response_function(response._data);
        }
      },
      onResponseError({ response }) {
        if (response_error_function) {
          response_error_function(response);
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
