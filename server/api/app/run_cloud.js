// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"
import { GoogleAuth } from "google-auth-library"
import { ServicesClient } from "@google-cloud/run"

// Local imports
import {
  artifactImages,
  checkRecaptchaParams,
  requestConfig,
} from "@ogw_server/utils/cloud"

export default defineEventHandler(async (event) => {
  try {
    const { name, email, launch } = await readBody(event)
    if (!checkRecaptchaParams(name, email, launch)) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "INTERNAL_ERROR" }),
      }
    }
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_KEY)
    const location = "europe-west9"
    const projectId = process.env.GOOGLE_CLOUD_PROJECT
    const parent = `projects/${projectId}/locations/${location}`
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    })
    const authClient = await auth.getClient()
    const [routerImage, backImage, viewerImage] = await artifactImages(
      parent,
      authClient,
    )
    const request = requestConfig(parent, routerImage, backImage, viewerImage)
    const runClient = new ServicesClient({ authClient })
    const [operation] = await runClient.createService(request)
    const [response] = await operation.promise()
    console.log("Service URL created:", response.uri)
    return {
      statusCode: 200,
      url: response.uri.replace(/^https?:\/\//i, ""),
    }
  } catch (error) {
    console.log(error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
