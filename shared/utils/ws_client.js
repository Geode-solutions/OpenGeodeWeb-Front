// Third party imports
import vtkWSLinkClient, { newInstance } from "@kitware/vtk.js/IO/Core/WSLinkClient.js";
import _ from "lodash";
import SmartConnect from "wslink/src/SmartConnect/index.js";

async function initWebSocketClient(baseUrl, initialClient = {}) {
  vtkWSLinkClient.setSmartConnectClass(SmartConnect);
  const client = _.isEmpty(initialClient) ? newInstance() : initialClient;

  client.onConnectionError((httpReq) => {
    const message = httpReq?.response?.error || `Connection error`;
    console.error(message);
  });
  client.onConnectionClose((httpReq) => {
    const message = httpReq?.response?.error || `Connection close`;
    status.value = Status.NOT_CONNECTED;
    console.error(message);
  });

  client.beginBusy();
  await client.connect({
    application: "Viewer",
    sessionURL: baseUrl,
  });

  return client;
}

export { initWebSocketClient }