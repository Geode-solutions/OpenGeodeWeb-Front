const storage = new Map();

function getAppBaseUrl() {
  return storage.get("APP_BASE_URL");
}
function setAppBaseUrl(baseUrl) {
  return storage.set("APP_BASE_URL", baseUrl);
}
function getBackBaseUrl() {
  return storage.get("BACK_BASE_URL");
}
function setBackBaseUrl(baseUrl) {
  return storage.set("BACK_BASE_URL", baseUrl);
}
function getViewerBaseUrl() {
  return storage.get("VIEWER_BASE_URL");
}
function setViewerBaseUrl(baseUrl) {
  return storage.set("VIEWER_BASE_URL", baseUrl);
}
function getIsAppReady() {
  return storage.get("IS_APP_READY") ?? false;
}
function setIsAppReady(isAppReady) {
  return storage.set("IS_APP_READY", isAppReady);
}


async function getViewerWebSocketClient() {
  const viewerClient = storage.get("VIEWER_CLIENT") ?? undefined;
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
  storage.set("VIEWER_CLIENT", client);
  return client;
}

export {
  getAppBaseUrl,
  getBackBaseUrl,
  getIsAppReady,
  getViewerBaseUrl,
  getViewerWebSocketClient,
  setAppBaseUrl,
  setBackBaseUrl,
  setIsAppReady,
  setViewerBaseUrl,
  setViewerWebSocketClient,
};
