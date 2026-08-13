// Node imports

// Third party imports

// Local imports
import { fetchSchema } from "./utils/fetch_schema.js";

import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_schemas.json" with { type: "json" };

function setAppBaseUrl(appBaseUrl) {
  console.log("[API] setAppBaseUrl", appBaseUrl);
  const schema = opengeodeweb_front_schemas.api.microservice.app.set_app_base_url;
  const params = { baseUrl: appBaseUrl };
  return fetchSchema({ schema, params, baseURL: appBaseUrl });
}

function setBackBaseUrl(appBaseUrl, backBaseUrl) {
  console.log("[API] setBackBaseUrl", appBaseUrl, backBaseUrl);
  const schema = opengeodeweb_front_schemas.api.microservice.app.set_back_base_url;
  const params = { baseUrl: backBaseUrl };
  return fetchSchema({ schema, params, baseURL: appBaseUrl });
}

function setViewerBaseUrl(appBaseUrl, viewerBaseUrl) {
  console.log("[API] setViewerBaseUrl", appBaseUrl, viewerBaseUrl);
  const schema = opengeodeweb_front_schemas.api.microservice.app.set_viewer_base_url;
  const params = { baseUrl: viewerBaseUrl };
  return fetchSchema({ schema, params, baseURL: appBaseUrl });
}

function setIsAppReady(appBaseUrl, isReady) {
  console.log("[API] setIsAppReady", isReady);
  const schema = opengeodeweb_front_schemas.api.microservice.app.set_is_app_ready;
  const params = { isReady };
  return fetchSchema({ schema, params, baseURL: appBaseUrl });
}

function getIsAppReady(appBaseUrl) {
  console.log("[API] getIsAppReady");
  const schema = opengeodeweb_front_schemas.api.microservice.app.get_is_app_ready;
  return fetchSchema({ schema, baseURL: appBaseUrl });
}

export { getIsAppReady, setAppBaseUrl, setBackBaseUrl, setIsAppReady, setViewerBaseUrl };
