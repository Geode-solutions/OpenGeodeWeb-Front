// Third party imports
import { createStorage, prefixStorage } from "unstorage";

// Local imports
import { createServerWsRpcClient } from "./ws_client.js";

const storage = createStorage();
const config = prefixStorage(storage, "config");

function getAppBaseUrl() {
  return config.getItem("APP_BASE_URL");
}
function setAppBaseUrl(baseUrl) {
  return config.setItem("APP_BASE_URL", baseUrl);
}
function getBackBaseUrl() {
  return config.getItem("BACK_BASE_URL");
}
function setBackBaseUrl(baseUrl) {
  return config.setItem("BACK_BASE_URL", baseUrl);
}
function getViewerBaseUrl() {
  return config.getItem("VIEWER_BASE_URL");
}
function setViewerBaseUrl(baseUrl) {
  return config.setItem("VIEWER_BASE_URL", baseUrl);
}

let viewerClient = undefined;

async function getViewerWebSocketClient() {
  console.log("getViewerWebSocketClient", { viewerClient });
  if (viewerClient?.isOpen()) {
    return viewerClient;
  }
  const viewerBaseUrl = await getViewerBaseUrl();
  return setViewerWebSocketClient(viewerBaseUrl);
}

async function setViewerWebSocketClient(baseUrl) {
  const client = createServerWsRpcClient(baseUrl);
  client.onConnectionClose(() => {
    if (viewerClient === client) {
      viewerClient = undefined;
    }
  });
  await client.ready;
  viewerClient = client;
  return client;
}

export {
  getAppBaseUrl,
  setAppBaseUrl,
  getBackBaseUrl,
  getViewerBaseUrl,
  getViewerWebSocketClient,
  setBackBaseUrl,
  setViewerBaseUrl,
  setViewerWebSocketClient,
};
