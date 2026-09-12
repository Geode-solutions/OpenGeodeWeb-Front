// Node imports
import child_process from "node:child_process";
import fs from "node:fs";
import { on } from "node:events";
import path from "node:path";
import readline from "node:readline";
import type { Readable } from "node:stream";

// Third party imports
import { getPort } from "get-port-please";

// Local imports
import { appMode } from "@geode/opengeodeweb-front/shared/app_mode.js";
import { setAppBaseUrl } from "@geode/opengeodeweb-front/shared/scripts.js";

const BYTES_PER_KIBIBYTE = 1024;
const MAX_ERROR_BUFFER_KIBIBYTES = 64;
const MAX_ERROR_BUFFER_BYTES = MAX_ERROR_BUFFER_KIBIBYTES * BYTES_PER_KIBIBYTE;
function getAvailablePort(): Promise<number> {
  return getPort({
    host: "localhost",
    random: true,
  });
}
function commandExistsSync(execName: string): boolean {
  const envPath = process.env.PATH || "";
  return envPath.split(path.delimiter).some((directory) => {
    const filePath = path.join(directory, execName);
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  });
}
const encoder = new TextEncoder();
function byteLength(str: string): number {
  return encoder.encode(str).byteLength;
}

interface NamedChildProcess
  extends child_process.ChildProcessByStdio<null, Readable, Readable> {
  name?: string;
}

// oxlint-disable-next-line max-lines-per-function
function waitForReady(
  child: NamedChildProcess,
  expectedResponse: string,
  signal?: AbortSignal,
): Promise<NamedChildProcess> {
  // oxlint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    const readlineStdout = readline.createInterface({
      input: child.stdout,
    });
    const readlineStderr = readline.createInterface({
      input: child.stderr,
    });
    let recentOutput = "";
    function recordOutput(lineOutput: string) {
      const safeLine =
        byteLength(lineOutput) > MAX_ERROR_BUFFER_BYTES / 2
          ? `${lineOutput.slice(0, MAX_ERROR_BUFFER_BYTES / 2)}…[truncated]`
          : lineOutput;
      recentOutput = `${recentOutput} ${safeLine}\n`;
      while (byteLength(recentOutput) > MAX_ERROR_BUFFER_BYTES) {
        const newline = recentOutput.indexOf("\n");
        if (newline === -1) {
          recentOutput = "";
          break;
        }
        recentOutput = recentOutput.slice(newline + 1);
      }
    }
    let onLine: ((line: string) => void) | undefined = undefined;
    let onErrLine: ((line: string) => void) | undefined = undefined;
    let onError: ((err: Error) => void) | undefined = undefined;
    let onClose: ((code: number | null) => void) | undefined = undefined;
    let onAbort: (() => void) | undefined = undefined;

    function cleanup() {
      if (onLine) {
        readlineStdout.removeListener("line", onLine);
      }
      if (onErrLine) {
        readlineStderr.removeListener("line", onErrLine);
      }
      if (onError) {
        child.removeListener("error", onError);
      }
      if (onClose) {
        child.removeListener("close", onClose);
      }
      if (signal && onAbort) {
        signal.removeEventListener("abort", onAbort);
      }
    }

    function becomeReady() {
      cleanup();
      readlineStdout.on("line", (line) => {
        console.log(`[${child.name}] ${line}`);
      });
      readlineStderr.on("line", (line) => {
        console.log(`[${child.name}] ${line}`);
      });
      child.once("close", (code) => {
        console.log(`[${child.name}] exited with code ${code}`);
      });
      resolve(child);
    }

    onLine = (lineOutput) => {
      console.log(`[${child.name}] ${lineOutput}`);
      recordOutput(lineOutput);
      if (lineOutput.includes(expectedResponse)) {
        becomeReady();
      }
    };

    onErrLine = (line) => {
      console.log(`[${child.name}] ${line}`);
      recordOutput(line);
      if (line.includes(expectedResponse)) {
        becomeReady();
      }
    };

    onError = (err) => {
      cleanup();
      reject(err);
    };

    onClose = (code) => {
      console.log(`[${child.name}] exited with code ${code}`);
      cleanup();
      reject(
        new Error(
          `[${child.name}] exited with code ${code} before becoming ready.${recentOutput ? `\nRecent output:\n${recentOutput}` : ""}`,
        ),
      );
    };

    onAbort = () => {
      cleanup();
      reject(new Error(`[${child.name}] timed out waiting for "${expectedResponse}"`));
    };
    readlineStdout.on("line", onLine);
    readlineStderr.on("line", onErrLine);
    child.once("error", onError);
    child.once("close", onClose);
    if (signal) {
      signal.addEventListener("abort", onAbort, {
        once: true,
      });
    }
  });
}
async function waitNuxt(nuxtProcess: child_process.ChildProcessWithoutNullStreams): Promise<string> {
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
    if (portMatch?.groups) {
      console.log("Nuxt listening on port", portMatch.groups.port);
      nuxtProcess.stdout.on("data", (newData) => {
        console.log("Nuxt STDOUT:", newData.toString().trim());
      });
      return portMatch.groups.port as string;
    }
  }
  throw new Error("Nuxt process closed");
}
async function runBrowser(scriptName: string): Promise<number> {
  process.env.MODE = appMode.BROWSER;
  const port = await getAvailablePort();
  const nuxtProcess = child_process.spawn("npm", ["run", scriptName], {
    shell: true,
    env: {
      ...process.env,
      PORT: String(port),
    },
  });
  await waitNuxt(nuxtProcess);
  await setAppBaseUrl(`http://localhost:${port}`);
  return port;
}
export { commandExistsSync, getAvailablePort, runBrowser, waitForReady };
export type { NamedChildProcess };
