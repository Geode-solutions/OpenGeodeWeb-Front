// Third party imports
import vtkWSLinkClient, {
  type vtkWSLinkClient as VtkWSLinkClient,
  newInstance,
} from "@kitware/vtk.js/IO/Core/WSLinkClient";
import SmartConnect from "wslink/src/SmartConnect";

interface WsClientCallbacks {
  onConnectionClose?: () => void;
}

// Wslink's connection event shape is untyped upstream; this describes the fields we read.
interface WsConnectionEvent {
  response?: { error?: string };
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

async function initWebSocketClient(
  baseUrl: string,
  initialClient: unknown = {},
  { onConnectionClose }: WsClientCallbacks = {},
): Promise<VtkWSLinkClient> {
  vtkWSLinkClient.setSmartConnectClass(SmartConnect);
  const client = isVtkWSLinkClient(initialClient) ? initialClient : newInstance();

  client.onConnectionError((httpReq: WsConnectionEvent) => {
    const message = httpReq.response?.error ?? "Connection error";
    console.error(message);
  });
  client.onConnectionClose((httpReq: WsConnectionEvent) => {
    const message = httpReq.response?.error ?? "Connection close";
    onConnectionClose?.();
    console.error(message);
  });

  client.beginBusy();
  await client.connect({
    application: "Viewer",
    sessionURL: baseUrl,
  });

  return client;
}

export { initWebSocketClient };
