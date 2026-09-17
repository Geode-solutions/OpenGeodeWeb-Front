// Third party imports
import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

// Local imports

const HELLO_ID = "system:hello";
const HELLO_SECRET = "wslink-secret";

interface PendingCall {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

interface WsRpcMessage {
  id?: string;
  error?: { message?: string };
  result?: unknown;
}

function isWsRpcMessage(value: unknown): value is WsRpcMessage {
  return typeof value === "object" && value !== null;
}

// oxlint-disable-next-line prefer-readonly-parameter-types
function rawDataToString(raw: WebSocket.RawData): string {
  if (Buffer.isBuffer(raw)) {
    return raw.toString();
  }
  if (Array.isArray(raw)) {
    return Buffer.concat(raw).toString();
  }
  return Buffer.from(raw).toString();
}

interface ServerWsRpcClient {
  call: (rpc: string, params?: Readonly<Record<string, unknown>>) => Promise<unknown>;
  close: () => void;
  isOpen: () => boolean;
  onConnectionClose: (callback: () => void) => void;
  onConnectionError: (callback: (error: unknown) => void) => void;
  ready: Promise<void>;
}

//oxlint-disable-next-line max-lines-per-function
function createServerWsRpcClient(baseUrl: string): ServerWsRpcClient {
  const socket = new WebSocket(baseUrl);
  const pending = new Map<string, PendingCall>();
  let onCloseCallback: (() => void) | undefined = undefined;
  let onErrorCallback: ((error: unknown) => void) | undefined = undefined;

  //oxlint-disable-next-line promise/avoid-new max-lines-per-function
  const ready = new Promise<void>((resolve, reject) => {
    socket.on("open", () => {
      socket.send(
        JSON.stringify({
          id: HELLO_ID,
          method: "wslink.hello",
          args: [{ secret: HELLO_SECRET }],
        }),
      );
    });

    // oxlint-disable-next-line prefer-readonly-parameter-types
    socket.on("message", (raw: WebSocket.RawData) => {
      let message: WsRpcMessage | undefined = undefined;
      try {
        const parsed: unknown = JSON.parse(rawDataToString(raw));
        if (!isWsRpcMessage(parsed)) {
          return;
        }
        message = parsed;
      } catch {
        return;
      }

      if (message.id === HELLO_ID) {
        resolve();
        return;
      }

      if (typeof message.id === "string" && message.id.startsWith("publish:")) {
        return;
      }

      const entry = message.id === undefined ? undefined : pending.get(message.id);
      if (!entry || message.id === undefined) {
        return;
      }
      pending.delete(message.id);
      if (message.error) {
        entry.reject(new Error(message.error.message ?? "wslink RPC error"));
      } else {
        entry.resolve(message.result);
      }
    });

    socket.on("error", (error: Readonly<Error>) => {
      onErrorCallback?.(error);
      reject(error);
    });

    socket.on("close", () => {
      onCloseCallback?.();
      for (const { reject: rejectPending } of pending.values()) {
        rejectPending(new Error("WebSocket closed"));
      }
      pending.clear();
    });
  });

  async function call(
    rpc: string,
    params: Readonly<Record<string, unknown>> = {},
  ): Promise<unknown> {
    await ready;
    const id = uuidv4();
    //oxlint-disable-next-line promise/avoid-new
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      socket.send(
        JSON.stringify({
          wslink: "1.0",
          id,
          method: rpc,
          args: [params],
          kwargs: { stream: true },
        }),
      );
    });
  }

  function close(): void {
    socket.close();
  }

  function isOpen(): boolean {
    return socket.readyState === WebSocket.OPEN;
  }

  //oxlint-disable-next-line promise/prefer-await-to-callbacks
  function onConnectionClose(callback: () => void): void {
    onCloseCallback = callback;
  }

  //oxlint-disable-next-line promise/prefer-await-to-callbacks
  function onConnectionError(callback: (error: unknown) => void): void {
    onErrorCallback = callback;
  }

  return { call, close, isOpen, onConnectionClose, onConnectionError, ready };
}

export { createServerWsRpcClient };
export type { ServerWsRpcClient };
