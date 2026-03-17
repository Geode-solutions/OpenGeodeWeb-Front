// Node imports

// Third party imports
import { createError, defineEventHandler, readBody } from "h3"
import { GoogleAuth } from "google-auth-library"
import { ServicesClient } from "@google-cloud/run"
import { google } from "googleapis"

// Local imports

function check_recaptcha_params(name, email, launch) {
  console.log("check_recaptcha_params", { name, email, launch })
  return name === "" && email === "" && launch === false
}

async function artifactImage(registry, parent, repo) {
  const branch = process.env.BRANCH
  const [_, projectId] = parent.split("/")
  const repository = `${parent}/repositories/ghcr/packages/geode-solutions%2F`
  const artifactRegistry = `europe-west9-docker.pkg.dev/${projectId}/ghcr/geode-solutions`
  const response =
    await registry.projects.locations.repositories.packages.tags.get({
      name: `${repository}${repo}/tags/${branch}`,
    })
  const digest = response.data.version.split("/").pop()
  const image = `${artifactRegistry}/${repo}@${digest}`
  console.log("Found image for", repo, image)
  return image
}

function artifactImages(parent, authClient) {
  const projectName = process.env.PROJECT
  const registry = google.artifactregistry({
    version: "v1",
    auth: authClient,
  })
  return Promise.all([
    artifactImage(registry, parent, "opengeodeweb-router"),
    artifactImage(registry, parent, `${projectName}-back`),
    artifactImage(registry, parent, `${projectName}-viewer`),
  ])
}

// oxlint-disable-next-line max-lines-per-function
function requestConfig(parent, routerImage, backImage, viewerImage) {
  const resources = {
    limits: {
      cpu: "1000m",
      memory: "512Mi",
    },
  }
  const volumeMounts = {
    name: "data",
    mountPath: "/data",
  }
  return {
    parent,
    service: {
      ingress: "INGRESS_TRAFFIC_ALL",
      invokerIamDisabled: true,
      scaling: {
        scalingMode: "MANUAL",
        manualInstanceCount: 1,
      },
      template: {
        volumes: [
          {
            name: "data",
            emptyDir: {
              medium: "MEMORY",
            },
          },
        ],
        containers: [
          {
            image: routerImage,
            ports: [
              {
                containerPort: 80,
              },
            ],
            resources,
          },
          {
            image: backImage,
            resources,
            volumeMounts: [volumeMounts],
          },
          {
            image: viewerImage,
            resources,
            volumeMounts: [volumeMounts],
          },
        ],
      },
    },
  }
}

export default defineEventHandler(async (event) => {
  try {
    const { name, email, launch } = await readBody(event)
    if (!check_recaptcha_params(name, email, launch)) {
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
      projectFolderPath,
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
