// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";
import { GoogleAuth } from "google-auth-library";
import { ServicesClient } from "@google-cloud/run";

// Local imports
import { artifactImage, requestConfig } from "@ogw_server/utils/cloud";

export default defineEventHandler(async (event) => {
  try {
    const { email } = await readBody(event);
    console.log("[RUN CLOUD] Received request to create backend for email:", email);
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_KEY);
    const location = "europe-west9";
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const projectName = process.env.PROJECT;
    const parent = `projects/${projectId}/locations/${location}`;
    console.log({ parent });
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const authClient = await auth.getClient();
    const image = await artifactImage(parent, authClient);
    const request = requestConfig(parent, image, email, projectName);
    console.log({ request });
    const runClient = new ServicesClient({ authClient });
    const [operation] = await runClient.createService(request);
    const [response] = await operation.promise();
    console.log("Service URL created:", response.uri);
    return {
      statusCode: 200,
      url: response.uri.replace(/^https?:\/\//iu, ""),
    };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
