// Node imports

// Third party imports

// Local imports
import { fetchSchema } from "./utils/fetch_schema.js";

function setAppBaseUrl(appBaseUrl) {
  console.log("[API] setAppBaseUrl", appBaseUrl);
  const schema = {
    $id: "/api/microservice/app/set_app_base_url",
    methods: ["POST"],
    type: "object",
    properties: {
      baseUrl: { type: "string" },
    },
    required: ["baseUrl"],
    additionalProperties: false,
  };
  const params = { baseUrl: appBaseUrl };
  return fetchSchema({ schema, params, baseURL: appBaseUrl });
}

function setBackBaseUrl(appBaseUrl, backBaseUrl) {
  console.log("[API] setBackBaseUrl", appBaseUrl, backBaseUrl);
  const schema = {
    $id: "/api/microservice/app/set_back_base_url",
    methods: ["POST"],
    type: "object",
    properties: {
      baseUrl: { type: "string" },
    },
    required: ["baseUrl"],
    additionalProperties: false,
  };
  const params = { baseUrl: backBaseUrl };
  return fetchSchema({ schema, params, baseURL: appBaseUrl });
}

function setViewerBaseUrl(appBaseUrl, viewerBaseUrl) {
  console.log("[API] setViewerBaseUrl", appBaseUrl, viewerBaseUrl);
  const schema = {
    $id: "/api/microservice/app/set_viewer_base_url",
    methods: ["POST"],
    type: "object",
    properties: {
      baseUrl: { type: "string" },
    },
    required: ["baseUrl"],
    additionalProperties: false,
  };
  const params = { baseUrl: viewerBaseUrl };
  return fetchSchema({ schema, params, baseURL: appBaseUrl });
}

function setIsAppReady(appBaseUrl, isReady) {
  console.log("[API] setIsAppReady", isReady);
  const schema = {
    $id: "/api/microservice/app/set_is_app_ready",
    methods: ["POST"],
    type: "object",
    properties: {
      isReady: { type: "boolean" },
    },
    required: ["baseUrl"],
    additionalProperties: false,
  };
  const params = { isReady };
  return fetchSchema({ schema, params, baseURL: appBaseUrl });
}

export { setAppBaseUrl, setBackBaseUrl, setIsAppReady, setViewerBaseUrl };
