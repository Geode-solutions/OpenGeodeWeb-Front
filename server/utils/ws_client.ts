// Third party imports
import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

// Local imports

const HELLO_ID = "system:hello";
const HELLO_SECRET = "wslink-secret";

//oxlint-disable-next-line max-lines-per-function
function createServerWsRpcClient(baseUrl) {
  const socket = new WebSocket(baseUrl);
  const pending = new Map();
  let onCloseCallback = undefined;
  let onErrorCallback = undefined;

  //oxlint-disable-next-line promise/avoid-new
  const ready = new Promise((resolve, reject) => {
    socket.on("open", () => {
      socket.send(
        JSON.stringify({
          id: HELLO_ID,
          method: "wslink.hello",
          args: [{ secret: HELLO_SECRET }],
        }),
      );
    });

    socket.on("message", (raw) => {
      console.log("RAW WS MESSAGE:", raw.toString());
      let message = undefined;
      try {
        message = JSON.parse(raw.toString());
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

      const entry = pending.get(message.id);
      if (!entry) {
        return;
      }
      pending.delete(message.id);
      if (message.error) {
        entry.reject(new Error(message.error.message || "wslink RPC error"));
      } else {
        entry.resolve(message.result);
      }
    });

    socket.on("error", (error) => {
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

  async function call(rpc, params = {}) {
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

  function close() {
    socket.close();
  }

  function isOpen() {
    return socket.readyState === WebSocket.OPEN;
  }

  //oxlint-disable-next-line promise/prefer-await-to-callbacks
  function onConnectionClose(callback) {
    onCloseCallback = callback;
  }

  //oxlint-disable-next-line promise/prefer-await-to-callbacks
  function onConnectionError(callback) {
    onErrorCallback = callback;
  }

  return { call, close, isOpen, onConnectionClose, onConnectionError, ready };
}

export { createServerWsRpcClient };
