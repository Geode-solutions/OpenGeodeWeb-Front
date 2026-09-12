// Third party imports
import vtkWSLinkClient, {
  newInstance,
  type vtkWSLinkClient as VtkWSLinkClient,
} from "@kitware/vtk.js/IO/Core/WSLinkClient";
import SmartConnect from "wslink/src/SmartConnect";
import _ from "lodash";

interface WsClientCallbacks {
  onConnectionClose?: () => void;
}

async function initWebSocketClient(
  baseUrl: string,
  initialClient: unknown = {},
  { onConnectionClose }: WsClientCallbacks = {},
): Promise<VtkWSLinkClient> {
  vtkWSLinkClient.setSmartConnectClass(SmartConnect);
  const client = (_.isEmpty(initialClient) ? newInstance() : initialClient) as VtkWSLinkClient;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- wslink's httpReq shape is untyped upstream.
  client.onConnectionError((httpReq: any) => {
    const message = httpReq?.response?.error || `Connection error`;
    console.error(message);
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- wslink's httpReq shape is untyped upstream.
  client.onConnectionClose((httpReq: any) => {
    const message = httpReq?.response?.error || `Connection close`;
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
