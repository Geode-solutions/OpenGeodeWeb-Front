// Global imports

// Third party imports
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import opengeodeweb_viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_front/utils/local/cleanup";
import { beforeAllTimeout, runMicroservices } from "@ogw_tests/integration/setup";
import { setupActivePinia } from "@ogw_tests/utils";
import { useViewerStore } from "@ogw_front/stores/viewer";

const CONNECT_TIMEOUT = 25_000;

let projectFolderPath = "";

describe("viewer Store", () => {
  beforeAll(async () => {
    setupActivePinia();
    ({ projectFolderPath } = await runMicroservices());
  }, beforeAllTimeout);

  afterAll(async () => {
    await cleanupBackend(projectFolderPath);
  });

  describe("actions", () => {
    describe("ws_connect", () => {
      test(
        "ws_connect",
        async () => {
          const viewerStore = useViewerStore();
          await viewerStore.ws_connect();
          expect(viewerStore.status).toBe(Status.CONNECTED);
        },
        CONNECT_TIMEOUT,
      );
    });
    describe("connect", () => {
      test(
        "connect",
        async () => {
          const viewerStore = useViewerStore();
          await viewerStore.connect();
          expect(viewerStore.status).toBe(Status.CONNECTED);
        },
        CONNECT_TIMEOUT,
      );
    });

    describe("request", () => {
      test(
        "request",
        () => {
          const schema = opengeodeweb_viewer_schemas.opengeodeweb_viewer.viewer.render;
          const viewerStore = useViewerStore();
          const timeout = 1;
          const params = {};
          expect(() =>
            viewerStore
              .request(schema, params, {}, timeout)
              .rejects.toThrow(`${schema.$id}: Timed out after ${timeout}ms, ${schema} ${params}`),
          ).toBeDefined();
        },
        CONNECT_TIMEOUT,
      );
    });
  });
});
