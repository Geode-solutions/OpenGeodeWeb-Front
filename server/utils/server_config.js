import { createStorage, prefixStorage } from "unstorage";

const storage = createStorage();
const config = prefixStorage(storage, "config");

function getAppBaseUrl() {
  return config.getItem("APP_BASE_URL");
}
function setAppBaseUrl(baseUrl) {
  return config.setItem("APP_BASE_URL", baseUrl);
}
function getBackBaseUrl() {
  console.log("getBackBaseUrl", config);
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

export {
  getAppBaseUrl,
  setAppBaseUrl,
  getBackBaseUrl,
  getViewerBaseUrl,
  setBackBaseUrl,
  setViewerBaseUrl,
};
