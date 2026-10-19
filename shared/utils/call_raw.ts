// Third party imports
import _ from "lodash";
import pTimeout from "p-timeout";

// Local imports
import type { RequestHandlers } from "./types.js";

interface RpcSession {
  readonly call: (rpc: string, params: readonly [object]) => Promise<unknown>;
}
interface RpcConnection {
  readonly getSession: () => RpcSession;
}
interface RpcClient {
  readonly call: (rpc: string, params: object) => Promise<unknown>;
  readonly getConnection: () => RpcConnection;
}

interface CallClientOptions {
  rpc: string;
  params?: object;
  client: RpcClient;
}

interface CallRawOptions extends CallClientOptions {
  timeout?: number;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return _.isPlainObject(value);
}

// Wslink encodes messages with msgpack, which sends undefined values as null where JSON omitted them
function omitUndefinedFields(record: object): Record<string, unknown> {
  function omitUndefined(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item: unknown) => omitUndefined(item));
    }
    if (isPlainRecord(value)) {
      return omitUndefinedFields(value);
    }
    return value;
  }
  return Object.fromEntries(
    Object.entries(record)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, omitUndefined(value)]),
  );
}

async function callClient({ rpc, params = {}, client }: CallClientOptions): Promise<unknown> {
  const definedParams = omitUndefinedFields(params);
  if (globalThis.window !== undefined) {
    const response = await client.getConnection().getSession().call(rpc, [definedParams]);
    return response;
  }
  const response = await client.call(rpc, definedParams);
  return response;
}

async function callRaw(
  { rpc, params = {}, client, timeout }: CallRawOptions,
  { request_error_function, response_function, response_error_function }: RequestHandlers = {},
): Promise<unknown> {
  async function performCall(): Promise<unknown> {
    try {
      const response = await callClient({ rpc, params, client });
      if (response_function) {
        await response_function(response);
      }
      return response;
    } catch (error) {
      if (request_error_function) {
        await request_error_function(error);
      }
      if (response_error_function) {
        await response_error_function(error);
      }
      throw error;
    }
  }

  if (timeout !== undefined && timeout > 0) {
    const result = await pTimeout(performCall(), {
      milliseconds: timeout,
      message: `${rpc}: Timed out after ${timeout}ms`,
    });
    return result;
  }

  const result = await performCall();
  return result;
}

export { callRaw };
export type { RpcClient };
