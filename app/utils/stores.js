import { useInfraStore } from "@ogw_front/stores/infra";
import { appMode } from "@ogw_front/utils/local/app_mode";

function isCloudMode() {
  const infraStore = useInfraStore();
  return infraStore.app_mode === appMode.CLOUD;
}

function getRestApiProtocol() {
  const protocol = isCloudMode() ? "https" : "http";
  return protocol;
}
function getRestApiPort(defaultLocalPort) {
  const port = isCloudMode() ? "443" : defaultLocalPort;
  return port;
}
function getWebsocketApiProtocol() {
  const protocol = isCloudMode() ? "wss" : "ws";
  return protocol;
}
function getWebsocketApiPort(defaultLocalPort) {
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
