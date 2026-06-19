// Node imports
import fs from "node:fs";
import { on } from "node:events";
import path from "node:path";
import readline from "node:readline";

import { appMode } from "./app_mode.js";

const BYTES_PER_KIBIBYTE = 1024;
const MAX_ERROR_BUFFER_KIBIBYTES = 64;
const MAX_ERROR_BUFFER_BYTES = MAX_ERROR_BUFFER_KIBIBYTES * BYTES_PER_KIBIBYTE;

function commandExistsSync(execName) {
  const envPath = process.env.PATH || "";
  return envPath.split(path.delimiter).some((directory) => {
    const filePath = path.join(directory, execName);
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  });
}

function waitForReady(child, expectedResponse, signal) {
  return new Promise((resolve, reject) => {
    const readlineStdout = readline.createInterface({ input: child.stdout });
    const readlineStderr = readline.createInterface({ input: child.stderr });

    let recentOutput = "";
    function recordOutput(line) {
      recentOutput = (recentOutput + line + "\n").slice(-MAX_ERROR_BUFFER_BYTES);
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

    const onLine = (line) => {
      console.log(`[${child.name}] ${line}`);
      recordOutput(line);
      if (line.includes(expectedResponse)) {
        cleanup();
        resolve(child);
      }
    };

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
          `[${child.name}] exited with code ${code} before becoming ready.` +
            (recentOutput ? `\nRecent output:\n${recentOutput}` : ""),
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
  for await (const [data] of on(nuxtProcess.stdout, "data")) {
    const output = data.toString();
    console.log("Nuxt:", output);
    const portMatch = output.match(/Listening on http:\/\/\[::\]:(?<port>\d+)/u);
    if (portMatch) {
      const [, nuxtPort] = portMatch;

      console.log("Nuxt listening on port", nuxtPort);
      return nuxtPort;
    }
  }
  throw new Error("Nuxt process closed without accepting connections");
}

async function runBrowser(scriptName) {
  process.env.MODE = appMode.BROWSER;

  const nuxtProcess = child_process.spawn("npm", ["run", scriptName], {
    shell: true,
    FORCE_COLOR: true,
  });
  return await waitNuxt(nuxtProcess);
}

export { runBrowser, waitForReady, commandExistsSync };
