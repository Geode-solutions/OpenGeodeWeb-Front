import { type ServerWsRpcClient, createServerWsRpcClient } from "./ws_client.js";

const stringStorage = new Map<string, string>();
const booleanStorage = new Map<string, boolean>();
const clientStorage = new Map<string, ServerWsRpcClient>();

function getAppBaseUrl(): string {
  const value = stringStorage.get("APP_BASE_URL");
  if (value === undefined) {
    throw new Error("APP_BASE_URL is not set");
  }
  return value;
}
function setAppBaseUrl(baseUrl: string): void {
  stringStorage.set("APP_BASE_URL", baseUrl);
}
function getBackBaseUrl(): string {
  const value = stringStorage.get("BACK_BASE_URL");
  if (value === undefined) {
    throw new Error("BACK_BASE_URL is not set");
  }
  return value;
}
function setBackBaseUrl(baseUrl: string): void {
  stringStorage.set("BACK_BASE_URL", baseUrl);
}
function getViewerBaseUrl(): string {
  const value = stringStorage.get("VIEWER_BASE_URL");
  if (value === undefined) {
    throw new Error("VIEWER_BASE_URL is not set");
  }
  return value;
}
function setViewerBaseUrl(baseUrl: string): void {
  stringStorage.set("VIEWER_BASE_URL", baseUrl);
}
function getIsAppReady(): boolean {
  return booleanStorage.get("IS_APP_READY") ?? false;
}
function setIsAppReady(isAppReady: boolean): void {
  booleanStorage.set("IS_APP_READY", isAppReady);
}
async function setViewerWebSocketClient(baseUrl: string): Promise<ServerWsRpcClient> {
  const client = createServerWsRpcClient(baseUrl);
  client.onConnectionClose(() => {
    if (clientStorage.get("VIEWER_CLIENT") === client) {
      clientStorage.delete("VIEWER_CLIENT");
    }
  });
  await client.ready;
  clientStorage.set("VIEWER_CLIENT", client);
  return client;
}
async function getViewerWebSocketClient(): Promise<ServerWsRpcClient> {
  const viewerClient = clientStorage.get("VIEWER_CLIENT");
  if (viewerClient !== undefined && viewerClient.isOpen()) {
    return viewerClient;
  }
  const viewerBaseUrl = getViewerBaseUrl();
  const client = await setViewerWebSocketClient(viewerBaseUrl);
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
