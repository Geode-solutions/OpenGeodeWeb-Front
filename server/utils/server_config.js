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

export {
  getAppBaseUrl,
  getBackBaseUrl,
  getIsAppReady,
  getViewerBaseUrl,
  setAppBaseUrl,
  setBackBaseUrl,
  setIsAppReady,
  setViewerBaseUrl,
};
