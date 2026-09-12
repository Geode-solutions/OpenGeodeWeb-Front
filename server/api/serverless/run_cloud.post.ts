// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3";
import { GoogleAuth } from "google-auth-library";
import { ServicesClient } from "@google-cloud/run";

// Local imports
import { artifactImage, requestConfig } from "@geode/opengeodeweb-front/server/utils/cloud.js";

interface RunCloudBody {
  email: string;
}

export default defineEventHandler(async (event) => {
  try {
    const { email } = await readBody<RunCloudBody>(event);
    console.log("[RUN CLOUD] Received request to create backend for email:", email);
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_KEY as string);
    const location = "europe-west9";
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const projectName = process.env.PROJECT as string;
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
    // @google-cloud/run bundles its own copy of google-auth-library's auth-client types,
    // Which isn't nominally assignable to the AuthClient from our direct dependency.
    const runClient = new ServicesClient({ authClient: authClient as never });
    const [operation] = await runClient.createService(request);
    const [response] = await operation.promise();
    console.log("Service URL created:", response.uri);
    return {
      statusCode: 200,
      url: (response.uri as string).replace(/^https?:\/\//iu, ""),
    };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message,
    });
  }
});
