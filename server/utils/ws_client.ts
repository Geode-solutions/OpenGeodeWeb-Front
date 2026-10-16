// Third party imports
import { Decoder, encode } from "@msgpack/msgpack";
import { UnChunker, generateChunks } from "wslink/src/WebsocketConnection/chunking";
import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

// Local imports

const HELLO_ID = "system:hello";
const HELLO_SECRET = "wslink-secret";
// Wslink default (512 KiB), until the hello response gives the server's limit
const DEFAULT_MAX_MSG_SIZE = 524_288;

interface PendingCall {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

interface WsRpcMessage {
  id?: string;
  error?: { message?: string };
  result?: { maxMsgSize?: number } & Record<string, unknown>;
}

function isWsRpcMessage(value: unknown): value is WsRpcMessage {
  return typeof value === "object" && value !== null;
}

// oxlint-disable-next-line prefer-readonly-parameter-types
function rawDataToBlob(raw: WebSocket.RawData): Blob {
  if (raw instanceof ArrayBuffer) {
    return new Blob([raw]);
  }
  return new Blob([Uint8Array.from(Array.isArray(raw) ? Buffer.concat(raw) : raw)]);
}

interface ServerWsRpcClient {
  call: (rpc: string, params?: object) => Promise<unknown>;
  close: () => void;
  getConnection: () => {
    getSession: () => {
      call: (rpc: string, params: readonly [object]) => Promise<unknown>;
    };
  };
  isOpen: () => boolean;
  notify: (method: string) => Promise<void>;
  onConnectionClose: (callback: () => void) => void;
  onConnectionError: (callback: (error: unknown) => void) => void;
  ready: Promise<void>;
}

//oxlint-disable-next-line max-lines-per-function
function createServerWsRpcClient(baseUrl: string): ServerWsRpcClient {
  const socket = new WebSocket(baseUrl);
  const pending = new Map<string, PendingCall>();
  // Wslink 2 messages are msgpack-encoded and split into chunks
  const unChunker = new UnChunker();
  let maxMsgSize = DEFAULT_MAX_MSG_SIZE;
  let onCloseCallback: (() => void) | undefined = undefined;
  let onErrorCallback: ((error: unknown) => void) | undefined = undefined;

  function send(message: object): void {
    for (const chunk of generateChunks(encode(message), maxMsgSize)) {
      socket.send(chunk);
    }
  }

  //oxlint-disable-next-line promise/avoid-new max-lines-per-function
  const ready = new Promise<void>((resolve, reject) => {
    socket.on("open", () => {
      send({
        wslink: "1.0",
        id: HELLO_ID,
        method: "wslink.hello",
        args: [{ secret: HELLO_SECRET }],
      });
    });

    // oxlint-disable-next-line prefer-readonly-parameter-types
    async function handleMessage(raw: WebSocket.RawData): Promise<void> {
      let message: WsRpcMessage | undefined = undefined;
      try {
        const decoded = await unChunker.processChunk(rawDataToBlob(raw), () => new Decoder());
        if (!isWsRpcMessage(decoded)) {
          return;
        }
        message = decoded;
      } catch {
        return;
      }

      if (message.id === HELLO_ID) {
        maxMsgSize = message.result?.maxMsgSize ?? maxMsgSize;
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
    }

    // oxlint-disable-next-line prefer-readonly-parameter-types
    socket.on("message", (raw: WebSocket.RawData) => {
      void handleMessage(raw);
    });

    socket.on("error", (error: Error) => {
      onErrorCallback?.(error);
      reject(error);
    });

    socket.on("close", () => {
      reject(new Error("WebSocket closed"));
      onCloseCallback?.();
      for (const { reject: rejectPending } of pending.values()) {
        rejectPending(new Error("WebSocket closed"));
      }
      pending.clear();
    });
  });

  async function call(rpc: string, params: object = {}): Promise<unknown> {
    await ready;
    const id = uuidv4();
    //oxlint-disable-next-line promise/avoid-new
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      send({
        wslink: "1.0",
        id,
        method: rpc,
        args: [params],
        kwargs: { stream: true },
      });
    });
  }

  // Call an RPC without arguments nor waiting for its response (e.g. "application.exit")
  async function notify(method: string): Promise<void> {
    await ready;
    send({ wslink: "1.0", id: method, method });
  }

  function close(): void {
    socket.close();
  }

  function getConnection(): ReturnType<ServerWsRpcClient["getConnection"]> {
    return {
      getSession: () => ({
        call: async (rpc: string, [params]: readonly [object]) => {
          const result = await call(rpc, params);
          return result;
        },
      }),
    };
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

  return {
    call,
    close,
    getConnection,
    isOpen,
    notify,
    onConnectionClose,
    onConnectionError,
    ready,
  };
}

export { createServerWsRpcClient };
export type { ServerWsRpcClient };
