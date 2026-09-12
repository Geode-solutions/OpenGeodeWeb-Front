import { appMode } from "#shared/app_mode";
import { useInfraStore } from "@ogw_front/stores/infra";

function isCloudMode(): boolean {
  const infraStore = useInfraStore();
  return infraStore.app_mode === appMode.CLOUD;
}

function getRestApiProtocol(): string {
  const protocol = isCloudMode() ? "https" : "http";
  return protocol;
}
function getRestApiPort(defaultLocalPort: string): string {
  const port = isCloudMode() ? "443" : defaultLocalPort;
  return port;
}
function getWebsocketApiProtocol(): string {
  const protocol = isCloudMode() ? "wss" : "ws";
  return protocol;
}
function getWebsocketApiPort(defaultLocalPort: string): string {
  const port = isCloudMode() ? "443" : defaultLocalPort;
  return port;
}

export {
  isCloudMode,
  getRestApiPort,
  getRestApiProtocol,
  getWebsocketApiProtocol,
  getWebsocketApiPort,
};
