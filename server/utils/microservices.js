// Node imports
import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json" with { type: "json" };

// Local imports
import { addNginxLocation, addSupervisorProgram } from "./cloud.js";
import { getAvailablePort, waitForReady } from "./scripts.js";
import { microservicesMetadatasPath, projectMicroservices } from "./cleanup.js";
import { executablePath } from "./path.js";

const MILLISECONDS_PER_SECOND = 1000;
const DEFAULT_TIMEOUT_SECONDS = 45;
const MAX_PORT_RETRIES = 1;

async function runScript(
  execPath,
  execName,
  args,
  expectedResponse,
  timeoutSeconds = DEFAULT_TIMEOUT_SECONDS,
) {
  const command = executablePath(execPath, execName);
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
  if (typeof timer.unref === "function") {
    timer.unref();
  }

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

function isPortInUseError(errorMessage) {
  return /EADDRINUSE|address already in use|port already in use/iu.test(errorMessage);
}

async function runBack(execName, execPath, args = {}, attempts = 0) {
  try {
    const port = await getAvailablePort();
    const executableArgs = backArgs(args, port);
    console.log("runBack", execPath, execName, executableArgs);
    await runScript(execPath, execName, executableArgs, "Serving Flask app");
    return port;
  } catch (error) {
    if (!isPortInUseError(error)) {
      console.log("runBack error", error);
      throw error;
    }
    if (attempts <= MAX_PORT_RETRIES) {
      console.log("Retrying runBack on conflicting port", port);
      const port = await runBack(execName, execPath, args, attempts + 1);
      return port;
    }
  }
}

async function runViewer(execName, execPath, args = {}, attempts = 0) {
  const { projectFolderPath } = args;
  if (!projectFolderPath) {
    throw new Error("projectFolderPath is required");
  }
  try {
    const port = await getAvailablePort();
    const viewerArgs = [
      "--port",
      String(port),
      "--project_folder_path",
      projectFolderPath,
      "--timeout",
      "0",
    ];
    console.log("runViewer", execPath, execName, viewerArgs);
    await runScript(execPath, execName, viewerArgs, "Starting factory");
    return port;
  } catch (error) {
    if (!isPortInUseError(error)) {
      console.log("runBack error", error);
      throw error;
    }
    if (attempts <= MAX_PORT_RETRIES) {
      console.log("Retrying runViewer on conflicting port", port);
      const port = await runViewer(execName, execPath, args, attempts + 1);
      return port;
    }
  }
}

function backArgs(args, port) {
  const { projectFolderPath } = args;
  if (!projectFolderPath) {
    throw new Error("projectFolderPath is required");
  }
  const uploadFolderPath = args.uploadFolderPath || path.join(projectFolderPath, "uploads");
  const executableArgs = [
    "--port",
    String(port),
    "--project_folder_path",
    projectFolderPath,
    "--upload_folder_path",
    uploadFolderPath,
    "--allowed_origins",
    "http://localhost:*",
    "--timeout",
    "0",
  ];
  if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
    executableArgs.push("--debug");
  }
  return executableArgs;
}

async function runExtension(extensionId, execName, execPath, args = {}, attempts = 0) {
  try {
    const port = await getAvailablePort();
    const executableArgs = backArgs(args, port);
    const command = executablePath(execPath, execName);
    console.log("runExtension", execPath, execName, executableArgs);
    addSupervisorProgram(extensionId, command, executableArgs);
    addNginxLocation(extensionId, port);
    return port;
  } catch (error) {
    if (!isPortInUseError(error)) {
      console.log("runBack error", error);
      throw error;
    }
    if (attempts <= MAX_PORT_RETRIES) {
      console.log("Retrying runExtension on conflicting port", port);
      const port = await runExtension(extensionId, execName, execPath, args, attempts + 1);
      return port;
    }
  }
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

export { addMicroserviceMetadatas, runBack, runExtension, runViewer };
