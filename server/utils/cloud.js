// Node imports

// Third party imports
import { google } from "googleapis";

// Local imports

async function artifactImage(parent, authClient) {
  const projectName = process.env.PROJECT;
  const registry = google.artifactregistry({
    version: "v1",
    auth: authClient,
  });
  const branch = process.env.NETLIFY_BRANCH;
  const [_, projectId] = parent.split("/");
  const repository = `${parent}/repositories/github/packages/`;
  const name = `${repository}${projectName}/tags/${branch}`;
  console.log({ name });
  const response = await registry.projects.locations.repositories.packages.tags.get({
    name,
  });
  console.log({ response });
  const digest = response.data.version.split("/").pop();
  const artifactRegistry = `europe-west9-docker.pkg.dev/${projectId}/github`;
  const image = `${artifactRegistry}/${projectName}@${digest}`;
  console.log("Found image for", projectName, image);
  return image;
}

function sanitizeLabelValue(label) {
  console.log("label", label);
  const maxLabelLength = 63;
  return label
    .toLowerCase()
    .replaceAll(/[^a-z0-9_-]/gu, "_")
    .slice(0, maxLabelLength);
}

function requestConfig(parent, image, email, projectName) {
  const resources = {
    limits: {
      cpu: "2000m",
      memory: "3Gi",
    },
    cpuIdle: false,
    startup_cpu_boost: true,
  };
  const labels = {
    user: sanitizeLabelValue(email),
    project: sanitizeLabelValue(projectName),
  };
  return {
    parent,
    service: {
      ingress: "INGRESS_TRAFFIC_ALL",
      invokerIamDisabled: true,
      labels,
      scaling: {
        scalingMode: "MANUAL",
        manualInstanceCount: 1,
      },
      template: {
        labels,
        timeout: { seconds: 3600 },
        containers: [
          {
            image,
            ports: [
              {
                containerPort: 80,
              },
            ],
            resources,
            env: [
              {
                name: "PARENT",
                value: parent,
              },
            ],
            startupProbe: {
              httpGet: {
                port: 80,
                path: "/viewer/healthcheck",
              },
              periodSeconds: 1,
              failureThreshold: 30,
            },
          },
        ],
      },
    },
  };
}

export { artifactImage, requestConfig };
