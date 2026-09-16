// Node imports
import fs from "node:fs";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

// Third party imports
import { WebSocket } from "ws";
import pTimeout from "p-timeout";
import { rimraf } from "rimraf";

interface Microservice {
  type: "back" | "viewer";
  name: string;
  port: number;
  url?: string;
  method?: string;
}

const MAX_DELETE_FOLDER_RETRIES = 5;

async function deleteFolderRecursive(folderPath: string): Promise<void> {
  if (!fs.existsSync(folderPath)) {
    console.log(`Folder ${folderPath} does not exist.`);
    return;
  }
  for (let i = 0; i <= MAX_DELETE_FOLDER_RETRIES; i += 1) {
    try {
      console.log(`Deleting folder: ${folderPath}`);
      // oxlint-disable-next-line no-await-in-loop
      await rimraf(folderPath);
      console.log(`Deleted folder: ${folderPath}`);
      return;
    } catch (error) {
      console.error(`Error deleting folder ${folderPath}:`, error);
      const MILLISECONDS_PER_RETRY = 1000;
      const DELAY = MILLISECONDS_PER_RETRY * (i + 1);
      // oxlint-disable-next-line no-await-in-loop
      await setTimeout(DELAY);
      console.log("Retrying delete folder");
    }
  }
  throw new Error(
    `Failed to delete folder ${folderPath} after ${MAX_DELETE_FOLDER_RETRIES} retries`,
  );
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  );
}

async function killHttpMicroservice(microservice: Readonly<Microservice>): Promise<void> {
  console.log("killHttpMicroservice", {
    ...microservice,
  });
  const failMessage = `Failed to kill ${microservice.name}`;
  async function do_kill(): Promise<void> {
    if (microservice.url === undefined) {
      return;
    }
    try {
      await fetch(microservice.url, {
        method: microservice.method,
      });
    } catch (error) {
      const message = isErrorWithMessage(error) ? error.message : String(error);
      console.log(`Expected error during kill of ${microservice.name}:`, message);
    }
  }
  await pTimeout(do_kill(), {
    milliseconds: 5000,
    message: failMessage,
  });
}

async function killWebsocketMicroservice(microservice: Readonly<Microservice>): Promise<void> {
  console.log("killWebsocketMicroservice", {
    ...microservice,
  });
  const failMessage = `Failed to kill ${microservice.name}`;
  const successMessage = `Disconnected from ${microservice.name} WebSocket server`;
  async function do_kill(): Promise<void> {
    if (microservice.url === undefined) {
      return;
    }
    const socketUrl = microservice.url;
    // oxlint-disable-next-line promise/avoid-new
    await new Promise<void>((resolve) => {
      const socket = new WebSocket(socketUrl);
      socket.on("open", () => {
        console.log("Connected to WebSocket server");
        socket.send(
          JSON.stringify({
            id: "system:hello",
            method: "wslink.hello",
            args: [
              {
                secret: "wslink-secret",
              },
            ],
          }),
        );
      });
      // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- Buffer's built-in mutating methods (write/fill/copy) can't be made structurally readonly
      socket.on("message", (data: Buffer | string) => {
        const message = data.toString();
        console.log("Received from server:", message);
        if (message.includes("hello")) {
          socket.send(
            JSON.stringify({
              id: "application.exit",
              method: "application.exit",
            }),
          );
          console.log(successMessage);
          socket.close();
          resolve();
        }
      });
      socket.on("close", () => {
        console.log(successMessage);
        resolve();
      });
      socket.on("error", (error: Readonly<Error>) => {
        console.error("WebSocket error:", error);
        socket.close();
        resolve();
      });
    });
  }
  await pTimeout(do_kill(), {
    milliseconds: 5000,
    message: failMessage,
  });
}

async function killMicroservice(microservice: Readonly<Microservice>): Promise<void> {
  if (microservice.type === "back") {
    await killHttpMicroservice(microservice);
  } else if (microservice.type === "viewer") {
    await killWebsocketMicroservice(microservice);
  } else {
    const exhaustiveCheck: never = microservice.type;
    throw new Error(`Unknown microservice type: ${String(exhaustiveCheck)}`);
  }
}

async function killMicroservices(
  microservices: readonly Readonly<Microservice>[],
): Promise<Readonly<Microservice>[]> {
  console.log("killMicroservices", {
    microservices,
  });
  const results = await Promise.allSettled(
    microservices.map(async (microservice) => {
      await killMicroservice(microservice);
    }),
  );
  return microservices.filter((_, index) => results[index]?.status !== "fulfilled");
}

function microservicesMetadatasPath(projectFolderPath: string): string {
  return path.join(projectFolderPath, "microservices.json");
}

function isMicroservicesMetadatas(value: unknown): value is { microservices: Microservice[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { microservices?: unknown }).microservices)
  );
}

function projectMicroservices(projectFolderPath: string): Microservice[] {
  console.log("projectMicroservices", {
    projectFolderPath,
  });
  const filePath = microservicesMetadatasPath(projectFolderPath);
  if (!fs.existsSync(filePath)) {
    const microservicesMetadatas = {
      microservices: [],
    };
    fs.writeFileSync(filePath, JSON.stringify(microservicesMetadatas, undefined, 2), "utf8");
  }
  const parsed: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!isMicroservicesMetadatas(parsed)) {
    throw new Error(`Invalid microservices metadata file: ${filePath}`);
  }
  return parsed.microservices;
}

async function cleanupBackend(projectFolderPath: string): Promise<void> {
  if (!fs.existsSync(projectFolderPath)) {
    console.log(`Folder ${projectFolderPath} does not exist. Skipping cleanup.`);
    return;
  }
  const microservices = projectMicroservices(projectFolderPath);
  await killMicroservices(microservices);
  await deleteFolderRecursive(projectFolderPath);
}

function getMicroserviceByName(
  microservices: readonly Readonly<Microservice>[],
  name: string,
): Microservice | undefined {
  const found = microservices.find((microservice) => microservice.name === name);
  return found === undefined ? undefined : { ...found };
}

export {
  cleanupBackend,
  deleteFolderRecursive,
  killMicroservice,
  microservicesMetadatasPath,
  projectMicroservices,
  getMicroserviceByName,
};
export type { Microservice };
