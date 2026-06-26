// Node imports
import child_process from "node:child_process";
import fs from "node:fs";
import { on } from "node:events";
import path from "node:path";
import readline from "node:readline";

// Third party imports
import { getPort } from "get-port-please";

// Local imports
import { appMode } from "./app_mode.js";

const BYTES_PER_KIBIBYTE = 1024;
const MAX_ERROR_BUFFER_KIBIBYTES = 64;
const MAX_ERROR_BUFFER_BYTES = MAX_ERROR_BUFFER_KIBIBYTES * BYTES_PER_KIBIBYTE;

function getAvailablePort() {
  return getPort({
    host: "localhost",
    random: true,
  });
}

function commandExistsSync(execName) {
  const envPath = process.env.PATH || "";
  return envPath.split(path.delimiter).some((directory) => {
    const filePath = path.join(directory, execName);
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  });
}

function waitForReady(child, expectedResponse, signal) {
  // oxlint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    const readlineStdout = readline.createInterface({ input: child.stdout });
    const readlineStderr = readline.createInterface({ input: child.stderr });

    let recentOutput = "";
    function recordOutput(line) {
      recentOutput = `${recentOutput} ${line} \n`.slice(-MAX_ERROR_BUFFER_BYTES);
    }

    function cleanup() {
      readlineStdout.removeAllListeners();
      readlineStdout.close();
      readlineStderr.removeAllListeners();
      readlineStderr.close();
      child.removeListener("error", onError);
      child.removeListener("close", onClose);
      if (signal) {
        signal.removeEventListener("abort", onAbort);
      }
    }

    function onLine(line) {
      console.log(`[${child.name}] ${line}`);
      recordOutput(line);
      if (line.includes(expectedResponse)) {
        resolve(child);
      }
    }

    function onErrLine(line) {
      console.log(`[${child.name}] ${line}`);
      recordOutput(line);
    }

    function onError(err) {
      cleanup();
      reject(err);
    }

    function onClose(code) {
      console.log(`[${child.name}] exited with code ${code}`);
      cleanup();
      reject(
        new Error(
          `[${child.name}] exited with code ${code} before becoming ready.${
            recentOutput ? `\nRecent output:\n${recentOutput}` : ""
          }`,
        ),
      );
    }

    function onAbort() {
      cleanup();
      reject(new Error(`[${child.name}] timed out waiting for "${expectedResponse}"`));
    }

    readlineStdout.on("line", onLine);
    readlineStderr.on("line", onErrLine);
    child.once("error", onError);
    child.once("close", onClose);
    if (signal) {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

async function waitNuxt(nuxtProcess) {
  nuxtProcess.stderr.on("data", (data) => {
    console.log("Nuxt STDERR:", data.toString().trim());
  });
  nuxtProcess.on("close", (code) => {
    console.log(`Nuxt process closed with code ${code}`);
  });

  for await (const [data] of on(nuxtProcess.stdout, "data")) {
    const output = data.toString();
    console.log("Nuxt STDOUT:", output.trim());
    const portMatch = output.match(/Listening on http:\/\/\[::\]:(?<port>\d+)/u);
    if (portMatch) {
      console.log("Nuxt listening on port", portMatch.groups.port);
      nuxtProcess.stdout.on("data", (newData) => {
        console.log("Nuxt STDOUT:", newData.toString().trim());
      });
      return portMatch.groups.port;
    }
  }
  throw new Error("Nuxt process closed");
}

async function runBrowser(scriptName) {
  process.env.MODE = appMode.BROWSER;

  const port = await getAvailablePort();

  const nuxtProcess = child_process.spawn("npm", ["run", scriptName], {
    shell: true,
    FORCE_COLOR: true,
    env: {
      ...process.env,
      PORT: port,
    },
  });
  return await waitNuxt(nuxtProcess);
}

export { commandExistsSync, getAvailablePort, runBrowser, waitForReady };
