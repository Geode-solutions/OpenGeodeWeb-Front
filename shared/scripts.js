// Node imports

// Third party imports

// Local imports

function setAppBaseUrl(baseUrl) {
  console.log(`Setting APP_BASE_URL to ${baseUrl}`);
  return fetch(`${baseUrl}/api/microservice/app/set_app_base_url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ baseUrl }),
  });
}

export { setAppBaseUrl };
