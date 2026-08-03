import { useStorage } from "#imports";

function getConfig() {
  return useStorage("config");
}
function getAppBaseUrl() {
  const config = getConfig();
  return config.getItem("APP_BASE_URL");
}
function setAppBaseUrl(baseUrl) {
  const config = getConfig();
  return config.setItem("APP_BASE_URL", baseUrl);
}
function getBackBaseUrl() {
  const config = getConfig();
  return config.getItem("BACK_BASE_URL");
}
function setBackBaseUrl(baseUrl) {
  const config = getConfig();
  return config.setItem("BACK_BASE_URL", baseUrl);
}
function getViewerBaseUrl() {
  const config = getConfig();
  return config.getItem("VIEWER_BASE_URL");
}
function setViewerBaseUrl(baseUrl) {
  const config = getConfig();
  return config.setItem("VIEWER_BASE_URL", baseUrl);
}

export {
  getAppBaseUrl,
  setAppBaseUrl,
  getBackBaseUrl,
  getViewerBaseUrl,
  setBackBaseUrl,
  setViewerBaseUrl,
};
