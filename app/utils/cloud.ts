import { consola } from "consola";

const CLOUD_URL_PARAM = "cloud_url";
const CLOUD_RUN_HOST_SUFFIX = ".run.app";

// Hostname of an already running Cloud Run service passed as `?cloud_url=`, restricted to Cloud Run hosts so a crafted link cannot point the app at an arbitrary server.
function getCloudUrlParam(): string | undefined {
  const value = new URLSearchParams(globalThis.location.search).get(CLOUD_URL_PARAM);
  if (value === null || value === "") {
    return undefined;
  }
  const url_string = value.includes("://") ? value : `https://${value}`;
  let hostname = "";
  try {
    ({ hostname } = new URL(url_string));
  } catch {
    consola.warn(`[Cloud] Invalid ${CLOUD_URL_PARAM}:`, value);
    return undefined;
  }
  if (!hostname.endsWith(CLOUD_RUN_HOST_SUFFIX)) {
    consola.warn(`[Cloud] Ignoring ${CLOUD_URL_PARAM}, not a Cloud Run host:`, hostname);
    return undefined;
  }
  return hostname;
}

// Drops `?cloud_url=` from the address bar, keeping the router's history state, so a later "Load the app" launches a new service.
function clearCloudUrlParam(): void {
  const url = new URL(globalThis.location.href);
  if (!url.searchParams.has(CLOUD_URL_PARAM)) {
    return;
  }
  url.searchParams.delete(CLOUD_URL_PARAM);
  globalThis.history.replaceState(globalThis.history.state, "", url);
}

export { clearCloudUrlParam, getCloudUrlParam };
