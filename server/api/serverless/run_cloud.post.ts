// Node imports

// Third party imports
import { GoogleAuth, type JWTInput } from "google-auth-library";
import { type H3Event, createError, defineEventHandler, readBody } from "h3";
import { ServicesClient } from "@google-cloud/run";

// Local imports
import { artifactImage, requestConfig } from "@geode/opengeodeweb-front/server/utils/cloud.ts";

interface RunCloudBody {
  email: string;
}

function isServiceAccountCredentials(value: unknown): value is JWTInput {
  return (
    typeof value === "object" && value !== null && "client_email" in value && "private_key" in value
  );
}

// oxlint-disable-next-line typescript/prefer-readonly-parameter-types
export default defineEventHandler(async (event: H3Event) => {
  try {
    const { email } = await readBody<RunCloudBody>(event);
    console.log("[RUN CLOUD] Received request to create backend for email:", email);

    const { GOOGLE_CLOUD_KEY, GOOGLE_CLOUD_PROJECT, PROJECT } = process.env;

    if (
      GOOGLE_CLOUD_KEY === undefined ||
      GOOGLE_CLOUD_KEY === "" ||
      GOOGLE_CLOUD_PROJECT === undefined ||
      GOOGLE_CLOUD_PROJECT === "" ||
      PROJECT === undefined ||
      PROJECT === ""
    ) {
      throw createError({
        statusCode: 500,
        statusMessage:
          "Missing required environment variables: GOOGLE_CLOUD_KEY, GOOGLE_CLOUD_PROJECT, or PROJECT",
      });
    }

    const projectId: string = GOOGLE_CLOUD_PROJECT;
    const projectName: string = PROJECT;

    const parsedKey: unknown = JSON.parse(GOOGLE_CLOUD_KEY);
    if (!isServiceAccountCredentials(parsedKey)) {
      throw createError({
        statusCode: 500,
        statusMessage: "GOOGLE_CLOUD_KEY is not a valid service account credentials JSON",
      });
    }
    const credentials: JWTInput = parsedKey;

    const location = "europe-west9";
    const parent = `projects/${projectId}/locations/${location}`;
    console.log({ parent });

    const auth = new GoogleAuth({
      // oxlint-disable-next-line typescript/no-deprecated
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

    if (response.uri === null || response.uri === undefined || response.uri === "") {
      throw createError({
        statusCode: 500,
        statusMessage: "Cloud Run service created but no URI was returned",
      });
    }

    console.log("Service URL created:", response.uri);
    return {
      statusCode: 200,
      url: response.uri.replace(/^https?:\/\//iu, ""),
    };
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : String(error),
    });
  }
});
