// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "@ogw_front/utils/status"
import * as composables from "../../../../../internal/utils/viewer_call.js"
import { useViewerStore } from "@ogw_front/stores/viewer"
import {
  delete_folder_recursive,
  kill_back,
  kill_viewer,
} from "@ogw_front/utils/local"
import { setupIntegrationTests } from "../../../setup.js"

// Local constants
const model_points_schemas = viewer_schemas.opengeodeweb_viewer.model.points
const file_name = "test.og_brep"
const geode_object = "BRep"

let id, back_port, viewer_port, project_folder_path

beforeEach(async () => {
  ;({ id, back_port, viewer_port, project_folder_path } =
    await setupIntegrationTests(file_name, geode_object))
}, 20000)

afterEach(async () => {
  console.log("afterEach model points kill", back_port, viewer_port)
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
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
        expect.objectContaining({ client: expect.anything() }),
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
        expect.objectContaining({ client: expect.anything() }),
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
