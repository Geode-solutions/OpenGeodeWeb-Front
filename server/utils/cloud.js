// Node imports

// Third party imports
import { google } from "googleapis";

// Local imports

async function artifactImage(registry, parent, repo) {
  const branch = process.env.NETLIFY_BRANCH;
  const [_, projectId] = parent.split("/");
  const repository = `${parent}/repositories/github/packages/`;
  const name = `${repository}${repo}/tags/${branch}`;
  console.log({ name });
  const response = await registry.projects.locations.repositories.packages.tags.get({
    name,
  });
  console.log({ response });
  const digest = response.data.version.split("/").pop();
  const artifactRegistry = `europe-west9-docker.pkg.dev/${projectId}/github`;
  const image = `${artifactRegistry}/${repo}@${digest}`;
  console.log("Found image for", repo, image);
  return image;
}

function artifactImages(parent, authClient) {
  const projectName = process.env.PROJECT;
  const registry = google.artifactregistry({
    version: "v1",
    auth: authClient,
  });
  return Promise.all([
    artifactImage(registry, parent, "opengeodeweb-router"),
    artifactImage(registry, parent, `${projectName}-back`),
    artifactImage(registry, parent, `${projectName}-viewer`),
  ]);
}

function sanitizeEmail(email) {
  const maxEmailLength = 63;
  return email
    .toLowerCase()
    .replaceAll(/[^a-z0-9_-]/gu, "_")
    .slice(0, maxEmailLength);
}

// oxlint-disable-next-line max-lines-per-function
function requestConfig(parent, routerImage, backImage, viewerImage, email) {
  const resources = {
    limits: {
      cpu: "1000m",
      memory: "1Gi",
    },
  };
  const volumeMounts = {
    name: "project",
    mountPath: "/project",
  };
  return {
    parent,
    service: {
      ingress: "INGRESS_TRAFFIC_ALL",
      invokerIamDisabled: true,
      labels: {
        user: sanitizeEmail(email),
      },
      scaling: {
        scalingMode: "MANUAL",
        manualInstanceCount: 1,
      },
      template: {
        labels: {
          user: sanitizeEmail(email),
        },
        volumes: [
          {
            name: "project",
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
  };
}

export { artifactImages, requestConfig };
