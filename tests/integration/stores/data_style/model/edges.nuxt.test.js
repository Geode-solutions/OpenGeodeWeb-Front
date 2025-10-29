// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "~/utils/status"
import * as composables from "~/composables/viewer_call"
import { useDataStyleStore } from "~/stores/data_style"
import { useViewerStore } from "~/stores/viewer"
import { setupIntegrationTests } from "../../../setup.js"

// Local constants
const model_edges_schemas = viewer_schemas.opengeodeweb_viewer.model.edges
const file_name = "test.og_brep"
const geode_object = "BRep"

let id, back_port, viewer_port

beforeEach(async () => {
  ;({ id, back_port, viewer_port } = await setupIntegrationTests(
    file_name,
    geode_object,
  ))
}, 20000)

afterEach(async () => {
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
})

describe("Model edges", () => {
  describe("Edges visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const visibility = true
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setModelEdgesVisibility(id, visibility)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_edges_schemas.visibility,
          params: { id, visibility },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.modelEdgesVisibility(id)).toBe(visibility)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
