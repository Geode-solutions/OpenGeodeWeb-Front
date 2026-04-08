// Node imports

// Third party imports
import { google } from "googleapis";

// Local imports

function checkRecaptchaParams(name, email, launch) {
  console.log("check_recaptcha_params", { name, email, launch });
  return name === "" && email === "" && launch === false;
}

async function artifactImage(registry, parent, repo) {
  const branch = process.env.BRANCH;
  const [_, projectId] = parent.split("/");
  const repository = `${parent}/repositories/ghcr/packages/geode-solutions%2F`;
  const name = `${repository}${repo}/tags/${branch}`;
  console.log({ name });
  const response = await registry.projects.locations.repositories.packages.tags.get({
    name,
  });
  const artifactRegistry = `europe-west9-docker.pkg.dev/${projectId}/ghcr/geode-solutions`;
  const digest = response.data.version.split("/").pop();
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

// oxlint-disable-next-line max-lines-per-function
function requestConfig(parent, routerImage, backImage, viewerImage) {
  const resources = {
    limits: {
      cpu: "1000m",
      memory: "512Mi",
    },
  };
  const volumeMounts = {
    name: "data",
    mountPath: "/data",
  };
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
  };
}

export { checkRecaptchaParams, artifactImages, requestConfig };
