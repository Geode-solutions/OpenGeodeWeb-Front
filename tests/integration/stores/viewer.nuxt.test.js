// Global imports

// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

import opengeodeweb_viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import Status from "@ogw_front/utils/status"
import { useViewerStore } from "@ogw_front/stores/viewer"

import { runMicroservices } from "../../integration/setup"

const CONNECT_TIMEOUT = 25000

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
      test(
        "ws_connect",
        async () => {
          await runMicroservices()
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
          await runMicroservices()
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
        },
        CONNECT_TIMEOUT,
      )
    })
  })
})
