// Node imports

// Third party imports

// Local imports
import { fetchSchema } from "./utils/fetch_schema.js";

import opengeodeweb_front_schemas from "@geode/opengeodeweb-front/opengeodeweb_front_schemas.json" with { type: "json" };

async function setAppBaseUrl(appBaseUrl: string): Promise<unknown> {
  console.log("[API] setAppBaseUrl", appBaseUrl);
  const schema = opengeodeweb_front_schemas.api.microservice.app.set_app_base_url;
  const params = { baseUrl: appBaseUrl };
  const result = await fetchSchema({ schema, params, baseURL: appBaseUrl });
  return result;
}

async function setBackBaseUrl(appBaseUrl: string, backBaseUrl: string): Promise<unknown> {
  console.log("[API] setBackBaseUrl", appBaseUrl, backBaseUrl);
  const schema = opengeodeweb_front_schemas.api.microservice.app.set_back_base_url;
  const params = { baseUrl: backBaseUrl };
  const result = await fetchSchema({ schema, params, baseURL: appBaseUrl });
  return result;
}

async function setViewerBaseUrl(appBaseUrl: string, viewerBaseUrl: string): Promise<unknown> {
  console.log("[API] setViewerBaseUrl", appBaseUrl, viewerBaseUrl);
  const schema = opengeodeweb_front_schemas.api.microservice.app.set_viewer_base_url;
  const params = { baseUrl: viewerBaseUrl };
  const result = await fetchSchema({ schema, params, baseURL: appBaseUrl });
  return result;
}

async function setIsAppReady(appBaseUrl: string, isReady: boolean): Promise<unknown> {
  console.log("[API] setIsAppReady", isReady);
  const schema = opengeodeweb_front_schemas.api.microservice.app.set_is_app_ready;
  const params = { isReady };
  const result = await fetchSchema({ schema, params, baseURL: appBaseUrl });
  return result;
}

async function getIsAppReady(appBaseUrl: string): Promise<unknown> {
  console.log("[API] getIsAppReady");
  const schema = opengeodeweb_front_schemas.api.microservice.app.get_is_app_ready;
  const result = await fetchSchema({ schema, baseURL: appBaseUrl });
  return result;
}

export { getIsAppReady, setAppBaseUrl, setBackBaseUrl, setIsAppReady, setViewerBaseUrl };
