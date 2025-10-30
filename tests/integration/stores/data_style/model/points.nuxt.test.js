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
const model_points_schemas = viewer_schemas.opengeodeweb_viewer.model.points
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
  console.log("afterEach model points kill", back_port, viewer_port)
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
})

describe("Model points", () => {
  describe("Points visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const visibility = true
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setModelPointsVisibility(id, visibility)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_points_schemas.visibility,
          params: { id, visibility },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.modelPointsVisibility(id)).toBe(visibility)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Points size", () => {
    test("Size 20", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const size = 20
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setModelPointsSize(id, size)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_points_schemas.size,
          params: { id, size },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.modelPointsSize(id)).toBe(size)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
