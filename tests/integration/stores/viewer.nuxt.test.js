// Global imports

// Third party imports
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import opengeodeweb_viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import {
  runMicroservices,
  teardownIntegrationTests,
} from "../../integration/setup"
import Status from "@ogw_front/utils/status"
import { setupActivePinia } from "../../utils"
import { useViewerStore } from "@ogw_front/stores/viewer"

const CONNECT_TIMEOUT = 25_000

let back_port = 0,
  viewer_port = 0,
  project_folder_path = ""

beforeEach(async() => {
  setupActivePinia()
  ;({ back_port, viewer_port, project_folder_path } =
  await runMicroservices())
})

afterEach(async () => {
  await teardownIntegrationTests(back_port, viewer_port, project_folder_path)
})

describe("Viewer Store", () => {
  describe("actions", () => {
    describe("ws_connect", () => {
      test(
        "ws_connect",
        async () => {
          const viewerStore = useViewerStore()
          await viewerStore.ws_connect()
          expect(viewerStore.status).toBe(Status.CONNECTED)
        },
        CONNECT_TIMEOUT,
      )
    })
    describe("connect", () => {
      test(
        "connect",
        async () => {
          const viewerStore = useViewerStore()
          await viewerStore.connect()
          expect(viewerStore.status).toBe(Status.CONNECTED)
        },
        CONNECT_TIMEOUT,
      )
    })

    describe("request", () => {
      test(
        "request",
        async () => {
          const schema =
            opengeodeweb_viewer_schemas.opengeodeweb_viewer.viewer.render
          const viewerStore = useViewerStore()
          const timeout = 1
          const params = {}
          expect(() =>
            viewerStore
              .request(schema, params, {}, timeout)
              .rejects.toThrow(
                `${schema.$id}: Timed out after ${timeout}ms, ${schema} ${params}`,
              ),
          )
        },
        CONNECT_TIMEOUT,
      )
    })
  })
})
