import { createServerWsRpcClient, type ServerWsRpcClient } from "./ws_client.js";

const storage = new Map<string, unknown>();
function getAppBaseUrl(): unknown {
  return storage.get("APP_BASE_URL");
}
function setAppBaseUrl(baseUrl: string) {
  return storage.set("APP_BASE_URL", baseUrl);
}
function getBackBaseUrl(): unknown {
  return storage.get("BACK_BASE_URL");
}
function setBackBaseUrl(baseUrl: string) {
  return storage.set("BACK_BASE_URL", baseUrl);
}
function getViewerBaseUrl(): unknown {
  return storage.get("VIEWER_BASE_URL");
}
function setViewerBaseUrl(baseUrl: string) {
  return storage.set("VIEWER_BASE_URL", baseUrl);
}
function getIsAppReady(): unknown {
  return storage.get("IS_APP_READY") ?? false;
}
function setIsAppReady(isAppReady: boolean) {
  return storage.set("IS_APP_READY", isAppReady);
}
async function setViewerWebSocketClient(baseUrl: string): Promise<ServerWsRpcClient> {
  const client = createServerWsRpcClient(baseUrl);
  client.onConnectionClose(() => {
    if (storage.get("VIEWER_CLIENT") === client) {
      storage.delete("VIEWER_CLIENT");
    }
  });
  await client.ready;
  storage.set("VIEWER_CLIENT", client);
  return client;
}
async function getViewerWebSocketClient(): Promise<ServerWsRpcClient> {
  const viewerClient = (storage.get("VIEWER_CLIENT") as ServerWsRpcClient | undefined) ?? undefined;
  if (viewerClient?.isOpen()) {
    return viewerClient;
  }
  const viewerBaseUrl = (await getViewerBaseUrl()) as string;
  return setViewerWebSocketClient(viewerBaseUrl);
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
