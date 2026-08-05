// Third party imports
import _ from "lodash";
import pTimeout from "p-timeout";

// Local imports

function callRaw(
  { rpc, params = {}, client, timeout },
  { request_error_function, response_function, response_error_function } = {},
) {
  if (!client.getConnection) {
    return;
  }

  async function performCall() {
    try {
      const response = await client.getConnection().getSession().call(rpc, [params]);
      if (response_function) {
        await response_function(response);
      }
      return response;
    } catch (error) {
      if (request_error_function) {
        request_error_function(error);
      }
      if (response_error_function) {
        response_error_function(error);
      }
      throw error;
    }
  }

  if (timeout > 0) {
    return pTimeout(performCall(), {
      milliseconds: timeout,
      message: `${rpc}: Timed out after ${timeout}ms`,
    });
  }

  return performCall();
}

export { callRaw };
