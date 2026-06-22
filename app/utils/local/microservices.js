// Node imports
import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json" with { type: "json" };
import { getPort } from "get-port-please";

// Local imports
import { commandExistsSync, waitForReady } from "./scripts.js";
import { microservicesMetadatasPath, projectMicroservices } from "./cleanup.js";
import { executablePath } from "./path.js";

const MILLISECONDS_PER_SECOND = 1000;
const DEFAULT_TIMEOUT_SECONDS = 30;

function getAvailablePort() {
  return getPort({
    host: "localhost",
    random: true,
  });
}

function resolveCommand(execPath, execName) {
  const command = commandExistsSync(execName) ? execName : executablePath(execPath, execName);
  return command;
}

async function runScript(
  execPath,
  execName,
  args,
  expectedResponse,
  timeoutSeconds = DEFAULT_TIMEOUT_SECONDS,
) {
  const command = resolveCommand(execPath, execName);
  console.log("runScript", command, args);

  const child = child_process.spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.name = command.replace(/^.*[\\/]/u, "");

  child.on("spawn", () => {
    console.log(`[${child.name}] spawned, pid=${child.pid}`);
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutSeconds * MILLISECONDS_PER_SECOND);
  if (typeof timer.unref === "function") { timer.unref(); }

  try {
    const result = await waitForReady(child, expectedResponse, controller.signal);
    clearTimeout(timer);
    return result;
  } catch (error) {
    clearTimeout(timer);
    child.kill();
    throw error;
  }
}

async function runBack(execName, execPath, args = {}) {
  const { projectFolderPath } = args;
  if (!projectFolderPath) {
    throw new Error("projectFolderPath is required");
  }
  let { uploadFolderPath } = args;
  if (!uploadFolderPath) {
    uploadFolderPath = path.join(projectFolderPath, "uploads");
  }
  const port = await getAvailablePort();
  const backArgs = [
    "--port",
    String(port),
    "--data_folder_path",
    projectFolderPath,
    "--upload_folder_path",
    uploadFolderPath,
    "--allowed_origin",
    "http://localhost:*",
    "--timeout",
    "0",
  ];
  if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
    backArgs.push("--debug");
  }
  console.log("runBack", execPath, execName, backArgs);
  await runScript(execPath, execName, backArgs, "Serving Flask app");
  return port;
}

async function runViewer(execName, execPath, args = {}) {
  const { projectFolderPath } = args;
  if (!projectFolderPath) {
    throw new Error("projectFolderPath is required");
  }
  const port = await getAvailablePort();
  const viewerArgs = [
    "--port",
    String(port),
    "--data_folder_path",
    projectFolderPath,
    "--timeout",
    "0",
  ];
  console.log("runViewer", execPath, execName, viewerArgs);
  await runScript(execPath, execName, viewerArgs, "Starting factory");
  return port;
}

function addMicroserviceMetadatas(projectFolderPath, serviceObj) {
  const microservices = projectMicroservices(projectFolderPath);
  if (serviceObj.type === "back") {
    const schema = back_schemas.opengeodeweb_back.kill;
    serviceObj.url = `http://localhost:${serviceObj.port}/${schema.$id}`;
    const [method] = schema.methods;
    serviceObj.method = method;
  } else if (serviceObj.type === "viewer") {
    serviceObj.url = `ws://localhost:${serviceObj.port}/ws`;
  }

  microservices.push(serviceObj);
  fs.writeFileSync(
    microservicesMetadatasPath(projectFolderPath),
    JSON.stringify({ microservices }, undefined, 2),
  );
}

export { addMicroserviceMetadatas, getAvailablePort, runBack, runViewer };
