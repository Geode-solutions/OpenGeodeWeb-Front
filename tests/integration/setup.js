// oxlint-disable vitest/require-top-level-describe

// Node.js imports
import { WebSocket } from "ws";
import path from "node:path";

// Third party imports
import { afterAll, beforeAll, expect, vi } from "vitest";

// Local imports
import { addMicroserviceMetadatas, runBack, runViewer } from "@ogw_front/utils/local/microservices";
import { createPath, generateProjectFolderPath } from "@ogw_front/utils/local/path";
import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_front/utils/local/app_mode";
import { importFile } from "@ogw_front/utils/import_workflow";
import { setupActivePinia } from "@ogw_tests/utils";
import { useGeodeStore } from "@ogw_front/stores/geode";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const beforeAllTimeout = 40_000;
const data_folder = path.join("tests", "integration", "data", "uploads");

async function runMicroservices() {
  const geodeStore = useGeodeStore();
  const infraStore = useInfraStore();
  const viewerStore = useViewerStore();
  infraStore.app_mode = appMode.BROWSER;
  const { COMMAND_BACK, PROJECT, COMMAND_VIEWER, NUXT_ROOT_PATH } = useRuntimeConfig().public;
  const projectFolderPath = generateProjectFolderPath(PROJECT);
  await createPath(projectFolderPath);

  const [back_port, viewer_port] = await Promise.all([
    runBack(COMMAND_BACK, NUXT_ROOT_PATH, {
      projectFolderPath,
      uploadFolderPath: data_folder,
    }),
    runViewer(COMMAND_VIEWER, NUXT_ROOT_PATH, { projectFolderPath }),
  ]);

  console.log("back_port", back_port);
  console.log("viewer_port", viewer_port);

  await addMicroserviceMetadatas(projectFolderPath, {
    type: "back",
    name: COMMAND_BACK,
    port: back_port,
  });
  await addMicroserviceMetadatas(projectFolderPath, {
    type: "viewer",
    name: COMMAND_VIEWER,
    port: viewer_port,
  });

  geodeStore.default_local_port = back_port;
  viewerStore.default_local_port = viewer_port;

  return {
    projectFolderPath,
  };
}

async function setupIntegrationTests(file_name, geode_object) {
  setupActivePinia();
  const viewerStore = useViewerStore();
  const { projectFolderPath } = await runMicroservices();
  await viewerStore.ws_connect();
  const id = await importFile(file_name, geode_object);
  expect(viewerStore.status).toBe(Status.CONNECTED);
  console.log("end of setupIntegrationTests", { id, projectFolderPath });
  return { id, projectFolderPath };
}

const mockLockRequest = vi.fn().mockImplementation(async (name, task) => await task({ name }));

vi.stubGlobal("navigator", {
  ...navigator,
  locks: {
    request: mockLockRequest,
  },
});

beforeAll(() => {
  globalThis.WebSocket = WebSocket;
});

afterAll(() => {
  delete globalThis.WebSocket;
});

export { beforeAllTimeout, runMicroservices, setupIntegrationTests };
