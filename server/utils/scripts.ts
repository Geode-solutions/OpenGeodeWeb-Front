// Node imports
import type { Readable } from "node:stream";
import child_process from "node:child_process";
import fs from "node:fs";
import { on } from "node:events";
import path from "node:path";
import readline from "node:readline";

// Third party imports
import { consola } from "consola";
import { getPort } from "get-port-please";

// Local imports
import { appMode } from "@geode/opengeodeweb-front/shared/app_mode.ts";
import { setAppBaseUrl } from "@geode/opengeodeweb-front/shared/scripts.ts";

const BYTES_PER_KIBIBYTE = 1024;
const MAX_ERROR_BUFFER_KIBIBYTES = 64;
const MAX_ERROR_BUFFER_BYTES = MAX_ERROR_BUFFER_KIBIBYTES * BYTES_PER_KIBIBYTE;

async function getAvailablePort(): Promise<number> {
  const port = await getPort({
    host: "localhost",
    random: true,
  });
  return port;
}

function commandExistsSync(execName: string): boolean {
  const envPath = process.env.PATH ?? "";
  return envPath.split(path.delimiter).some((directory) => {
    const filePath = path.join(directory, execName);
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  });
}

const encoder = new TextEncoder();
function byteLength(str: string): number {
  return encoder.encode(str).byteLength;
}

interface NamedChildProcess extends child_process.ChildProcessByStdio<null, Readable, Readable> {
  name?: string;
}

function truncateLine(lineOutput: string): string {
  const halfBuffer = MAX_ERROR_BUFFER_BYTES / 2;
  return byteLength(lineOutput) > halfBuffer
    ? `${lineOutput.slice(0, halfBuffer)}…[truncated]`
    : lineOutput;
}

function trimOutputBuffer(output: string): string {
  let trimmed = output;
  while (byteLength(trimmed) > MAX_ERROR_BUFFER_BYTES) {
    const newline = trimmed.indexOf("\n");
    if (newline === -1) {
      return "";
    }
    trimmed = trimmed.slice(newline + 1);
  }
  return trimmed;
}

function createOutputRecorder(): { record: (lineOutput: string) => void; read: () => string } {
  let recentOutput = "";
  function record(lineOutput: string): void {
    recentOutput = trimOutputBuffer(`${recentOutput} ${truncateLine(lineOutput)}\n`);
  }
  function read(): string {
    return recentOutput;
  }
  return { record, read };
}

// oxlint-disable-next-line max-lines-per-function typescript/prefer-readonly-parameter-types eslint/require-await
async function waitForReady(
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
    const recorder = createOutputRecorder();
    let onLine: ((line: string) => void) | undefined = undefined;
    let onError: ((err: Error) => void) | undefined = undefined;
    let onClose: ((code: number | null) => void) | undefined = undefined;
    let onAbort: (() => void) | undefined = undefined;

    function cleanup(): void {
      if (onLine) {
        readlineStdout.removeListener("line", onLine);
        readlineStderr.removeListener("line", onLine);
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

    function becomeReady(): void {
      cleanup();
      readlineStdout.on("line", (line) => {
        consola.info(`[${child.name}] ${line}`);
      });
      readlineStderr.on("line", (line) => {
        consola.info(`[${child.name}] ${line}`);
      });
      child.once("close", (code) => {
        consola.info(`[${child.name}] exited with code ${code}`);
      });
      resolve(child);
    }

    onLine = (lineOutput): void => {
      consola.info(`[${child.name}] ${lineOutput}`);
      recorder.record(lineOutput);
      if (lineOutput.includes(expectedResponse)) {
        becomeReady();
      }
    };

    onError = (err): void => {
      cleanup();
      reject(err);
    };

    onClose = (code): void => {
      consola.info(`[${child.name}] exited with code ${code}`);
      cleanup();
      const recentOutput = recorder.read();
      reject(
        new Error(
          `[${child.name}] exited with code ${code} before becoming ready.${recentOutput ? `\nRecent output:\n${recentOutput}` : ""}`,
        ),
      );
    };

    onAbort = (): void => {
      cleanup();
      reject(new Error(`[${child.name}] timed out waiting for "${expectedResponse}"`));
    };
    readlineStdout.on("line", onLine);
    readlineStderr.on("line", onLine);
    child.once("error", onError);
    child.once("close", onClose);
    if (signal) {
      signal.addEventListener("abort", onAbort, {
        once: true,
      });
    }
  });
}
async function waitNuxt(
  nuxtProcess: child_process.ChildProcessWithoutNullStreams,
): Promise<string> {
  nuxtProcess.stderr.on("data", (data: Buffer) => {
    consola.info("Nuxt STDERR:", data.toString().trim());
  });
  nuxtProcess.on("close", (code) => {
    consola.info(`Nuxt process closed with code ${code}`);
  });
  for await (const [data] of on(nuxtProcess.stdout, "data")) {
    const output = String(data);
    consola.info("Nuxt STDOUT:", output.trim());
    const portMatch = /Listening on http:\/\/\[::\]:(?<port>\d+)/u.exec(output);
    const port = portMatch?.groups?.port;
    if (port !== undefined) {
      consola.info("Nuxt listening on port", port);
      nuxtProcess.stdout.on("data", (newData: Buffer) => {
        consola.info("Nuxt STDOUT:", newData.toString().trim());
      });
      return port;
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
