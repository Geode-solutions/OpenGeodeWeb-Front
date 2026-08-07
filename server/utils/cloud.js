// Node imports

// Third party imports
import { google } from "googleapis";

// Local imports

const LOCATIONS_DIR = "/etc/nginx/locations";

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

function addSupervisorProgram(name, command, executableArgs) {
  const conf = `
[program:${name}]
command=${command} ${executableArgs.join(" ")}
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
`;
  const confPath = path.join("/etc/supervisor/conf.d", `${name}.conf`);
  fs.writeFileSync(confPath, conf);
  execFileSync("supervisorctl", ["reread"]);
  execFileSync("supervisorctl", ["update"]);
  const stdout = execFileSync("supervisorctl", ["start", name]);
  console.log("addSupervisorProgram", stdout);
}

function buildLocationBlock(routePath, port) {
  if (!routePath.startsWith("/") || !routePath.endsWith("/")) {
    throw new Error(`routePath must start and end with '/', got: ${routePath}`);
  }
  const methods = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
  const limitMethods = methods
    .split(",")
    .map((method) => method.trim())
    .filter((method) => method !== "OPTIONS")
    .join(" ");

  return `# ====================== ${routePath} location ======================
location ~ "^${routePath}" {
  if ($request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin'      $allow_origin always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods'     '${methods}' always;
    add_header 'Access-Control-Allow-Headers'     'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-CSRF-Token' always;
    add_header 'Access-Control-Max-Age'           1728000 always;
    add_header 'Content-Type'                     'text/plain; charset=utf-8';
    add_header 'Content-Length'                   0;
    return 204;
  }
 
  limit_except ${limitMethods} { deny all; }
 
  add_header 'Access-Control-Allow-Origin'      $allow_origin always;
  add_header 'Access-Control-Allow-Credentials' 'true' always;
  add_header 'Access-Control-Allow-Methods'     '${methods}' always;
  add_header 'Access-Control-Allow-Headers'     'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-CSRF-Token' always;
  add_header 'Access-Control-Expose-Headers'    'Content-Length,Content-Range' always;
  add_header 'Vary'                             'Origin' always;
 
  rewrite "^${routePath}(.*)" /$1 break;
  proxy_pass http://localhost:${port};
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
`;
}

function nginxConfigFile(name) {
  return path.join(LOCATIONS_DIR, `${name}.conf`);
}

function nginxReload() {
  execFileSync("nginx", ["-t"]);
  execFileSync("nginx", ["-s", "reload"]);
}

function addNginxLocation(name, port) {
  fs.mkdirSync(LOCATIONS_DIR, { recursive: true });
  const filePath = nginxConfigFile(name);
  if (fs.existsSync(filePath)) {
    throw new Error(`Location '${name}' already exists at ${filePath}`);
  }
  fs.writeFileSync(filePath, buildLocationBlock(`/${name}/`, port));
  try {
    nginxReload();
  } catch (error) {
    fs.unlinkSync(filePath);
    throw error;
  }
  return filePath;
}

function removeNginxLocation(name) {
  const filePath = filePathFor(name);
  if (!fs.existsSync(filePath)) {
    return false;
  }
  fs.unlinkSync(filePath);
  nginxReload();
  return true;
}

export {
  addNginxLocation,
  addSupervisorProgram,
  artifactImage,
  removeNginxLocation,
  requestConfig,
};
