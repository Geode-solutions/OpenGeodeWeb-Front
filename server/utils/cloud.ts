// Node imports
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Third party imports

// Local imports

const LOCATIONS_DIR = "/etc/nginx/locations";

function addSupervisorProgram(
  name: string,
  command: string,
  executableArgs: readonly string[],
): void {
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

function buildLocationBlock(routePath: string, port: number): string {
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

function nginxConfigFile(name: string): string {
  return path.join(LOCATIONS_DIR, `${name}.conf`);
}

function nginxReload(): void {
  execFileSync("nginx", ["-t"]);
  execFileSync("nginx", ["-s", "reload"]);
}

function addNginxLocation(name: string, port: number): string {
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

function removeNginxLocation(name: string): boolean {
  const filePath = nginxConfigFile(name);
  if (!fs.existsSync(filePath)) {
    return false;
  }
  fs.unlinkSync(filePath);
  nginxReload();
  return true;
}

export { addNginxLocation, addSupervisorProgram, removeNginxLocation };
