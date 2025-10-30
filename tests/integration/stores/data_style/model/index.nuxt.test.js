// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "~/utils/status"
import * as composables from "~/composables/viewer_call"
import { useDataStyleStore } from "~/stores/data_style"
import { useViewerStore } from "~/stores/viewer"
import { kill_back, kill_viewer } from "~/utils/local"
import { setupIntegrationTests } from "../../../setup.js"

// Local constants
const model_schemas = viewer_schemas.opengeodeweb_viewer.model
const file_name = "test.og_brep"
const geode_object = "BRep"

let id, back_port, viewer_port

beforeEach(async () => {
  ;({ id, back_port, viewer_port } = await setupIntegrationTests(
    file_name,
    geode_object,
  ))
}, 25000)

afterEach(async () => {
  console.log("afterEach model kill", back_port, viewer_port)
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
})

describe("Model", () => {
  describe("Model visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const visibility = true
      await dataStyleStore.setModelVisibility(id, visibility)
      const spy = vi.spyOn(composables, "viewer_call")
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_schemas.visibility,
          params: { id, visibility },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.modelVisibility(id)).toBe(visibility)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
