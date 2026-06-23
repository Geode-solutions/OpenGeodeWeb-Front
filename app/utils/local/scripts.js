// Node imports
import child_process from "node:child_process";
import fs from "node:fs";
import { on } from "node:events";
import path from "node:path";

import { appMode } from "./app_mode.js";

function commandExistsSync(execName) {
  const envPath = process.env.PATH || "";
  return envPath.split(path.delimiter).some((dir) => {
    const filePath = path.join(dir, execName);
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  });
}

async function waitForReady(child, expectedResponse) {
  for await (const [data] of on(child.stdout, "data")) {
    if (data.toString().includes(expectedResponse)) {
      return child;
    }
  }
  throw new Error("Process closed before signal");
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

  const nuxtProcess = child_process.spawn("npm", ["run", scriptName], {
    shell: true,
    FORCE_COLOR: true,
  });
  return await waitNuxt(nuxtProcess);
}

export { runBrowser, waitForReady, commandExistsSync };
