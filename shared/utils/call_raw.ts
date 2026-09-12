// Third party imports
import _ from "lodash";
import pTimeout from "p-timeout";

// Local imports
import type { RequestHandlers } from "./types.js";

interface RpcSession {
  call: (rpc: string, params: [Record<string, unknown>]) => Promise<unknown>;
}
interface RpcConnection {
  getSession: () => RpcSession;
}
interface RpcClient {
  call: (rpc: string, params: Record<string, unknown>) => Promise<unknown>;
  getConnection: () => RpcConnection;
}

interface CallRawOptions {
  rpc: string;
  params?: Record<string, unknown>;
  client: RpcClient;
  timeout?: number;
}

function callClient({ rpc, params = {}, client }: Omit<CallRawOptions, "timeout">) {
  if (globalThis.window !== undefined) {
    return client.getConnection().getSession().call(rpc, [params]);
  }
  return client.call(rpc, params);
}

function callRaw(
  { rpc, params = {}, client, timeout }: CallRawOptions,
  { request_error_function, response_function, response_error_function }: RequestHandlers = {},
) {
  async function performCall() {
    try {
      const response = await callClient({ rpc, params, client });
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

  if (timeout && timeout > 0) {
    return pTimeout(performCall(), {
      milliseconds: timeout,
      message: `${rpc}: Timed out after ${timeout}ms`,
    });
  }

  return performCall();
}

export { callRaw };
export type { RpcClient };
