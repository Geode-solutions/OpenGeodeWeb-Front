// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "@ogw_f/utils/status"
import * as composables from "@ogw_f/composables/viewer_call"
import { useDataStyleStore } from "@ogw_f/stores/data_style"
import { useViewerStore } from "@ogw_f/stores/viewer"
import {
  delete_folder_recursive,
  kill_back,
  kill_viewer,
} from "@ogw_f/utils/local"
import { setupIntegrationTests } from "../../../setup.js"

// Local constants
const model_edges_schemas = viewer_schemas.opengeodeweb_viewer.model.edges
const file_name = "test.og_brep"
const geode_object = "BRep"

let id, back_port, viewer_port, project_folder_path

beforeEach(async () => {
  ;({ id, back_port, viewer_port, project_folder_path } =
    await setupIntegrationTests(file_name, geode_object))
}, 25000)

afterEach(async () => {
  console.log(
    "afterEach model edges kill",
    back_port,
    viewer_port,
    project_folder_path,
  )
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
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
