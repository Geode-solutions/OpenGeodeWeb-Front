// Third party imports
import vtkWSLinkClient, {
  type vtkWSLinkClient as VtkWSLinkClient,
  newInstance,
} from "@kitware/vtk.js/IO/Core/WSLinkClient";
import type { Message } from "@ogw_front/types/ui";
import SmartConnect from "wslink/src/SmartConnect";
import type { Url } from "@ogw_front/types/files";
import { consola } from "consola";

interface WsClientCallbacks {
  onConnectionClose?: () => void;
}

// Wslink's connection event shape is untyped upstream; this describes the fields we read.
interface WsConnectionEvent {
  response?: { error?: Message };
}

function isVtkWSLinkClient(value: unknown): value is VtkWSLinkClient {
  return (
    typeof value === "object" &&
    value !== null &&
    "connect" in value &&
    "onConnectionError" in value &&
    "onConnectionClose" in value
  );
}

function resolveClient(initialClient: unknown): VtkWSLinkClient {
  if (isVtkWSLinkClient(initialClient)) {
    return initialClient;
  }
  return newInstance();
}

async function initWebSocketClient(
  baseUrl: Url,
  initialClient: unknown = {},
  { onConnectionClose }: WsClientCallbacks = {},
): Promise<VtkWSLinkClient> {
  vtkWSLinkClient.setSmartConnectClass(SmartConnect);
  const client = resolveClient(initialClient);

  client.onConnectionError((httpReq: WsConnectionEvent) => {
    const message = httpReq.response?.error ?? "Connection error";
    consola.error(message);
  });
  client.onConnectionClose((httpReq: WsConnectionEvent) => {
    const message = httpReq.response?.error ?? "Connection close";
    onConnectionClose?.();
    consola.error(message);
  });

  client.beginBusy();
  await client.connect({
    application: "Viewer",
    sessionURL: baseUrl,
  });

  return client;
}

export { initWebSocketClient };
