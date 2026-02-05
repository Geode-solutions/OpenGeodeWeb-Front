// Global imports

// Third party imports
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { describe, test, expect, beforeEach, vi } from "vitest"

import opengeodeweb_viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import Status from "@ogw_front/utils/status"

import { runMicroservices } from "../../integration/setup"

beforeEach(() => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
})

describe("Viewer Store", () => {
  describe("actions", () => {
    describe("ws_connect", () => {
      test("ws_connect", async () => {
        await runMicroservices()
        const viewerStore = useViewerStore()
        await viewerStore.ws_connect()
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }, 25000)
    })
    describe("connect", () => {
      test("connect", async () => {
        await runMicroservices()
        const viewerStore = useViewerStore()
        await viewerStore.connect()
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }, 25000)
    })

    describe("request", () => {
      test("request", async () => {
        const schema =
          opengeodeweb_viewer_schemas.opengeodeweb_viewer.viewer.render
        await runMicroservices()
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
      }, 25000)
    })
  })
})
