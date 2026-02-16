// Global imports

// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

import opengeodeweb_viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import Status from "@ogw_front/utils/status"
import { useViewerStore } from "@ogw_front/stores/viewer"

import {
  runMicroservices,
  teardownIntegrationTests,
} from "../../integration/setup"

const CONNECT_TIMEOUT = 25000

let back_port = 0,
  viewer_port = 0,
  project_folder_path = ""

beforeEach(() => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
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
          ;({ back_port, viewer_port, project_folder_path } =
            await runMicroservices())
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
          ;({ back_port, viewer_port, project_folder_path } =
            await runMicroservices())
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
          ;({ back_port, viewer_port, project_folder_path } =
            await runMicroservices())
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
