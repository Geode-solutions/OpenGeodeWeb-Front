// Third party imports
import _ from "lodash";
import pTimeout from "p-timeout";

// Local imports

function callClient({ rpc, params = {}, client }) {
  console.log("callClient", { rpc, params, client });

  if (globalThis.window !== undefined) {
    return client.getConnection().getSession().call(rpc, [params]);
  }
  console.log(`Calling from server ${rpc} with params:`, params);
  return client.call(rpc, params, { stream: true });
}

function callRaw(
  { rpc, params = {}, client, timeout },
  { request_error_function, response_function, response_error_function } = {},
) {
  console.log("callRaw", { rpc, params, timeout });

  async function performCall() {
    try {
      const response = await callClient({ rpc, params, client });
      console.log(`callRaw response for ${rpc}:`, { response });
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
