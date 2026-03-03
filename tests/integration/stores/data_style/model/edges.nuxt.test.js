// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import { deleteFolderRecursive } from "@ogw_front/utils/local/path"
import { killBack, killViewer } from "@ogw_front/utils/local/microservices"
import Status from "@ogw_front/utils/status"
import { setupIntegrationTests } from "../../../setup"
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const INTERVAL_TIMEOUT = 25_000
const model_edges_schemas = viewer_schemas.opengeodeweb_viewer.model.edges
const file_name = "test.og_brep"
const geode_object = "BRep"

let back_port = 0,
  id = "",
  project_folder_path = "",
  viewer_port = 0

beforeEach(async () => {
  ;({ id, back_port, viewer_port, project_folder_path } =
    await setupIntegrationTests(file_name, geode_object))
}, INTERVAL_TIMEOUT)

afterEach(async () => {
  console.log(
    "afterEach model edges kill",
    back_port,
    viewer_port,
    project_folder_path,
  )
  await Promise.all([killBack(back_port), killViewer(viewer_port)])
  deleteFolderRecursive(project_folder_path)
})

describe("Model edges", () => {
  describe("Edges visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const visibility = true
      const spy = vi.spyOn(viewerStore, "request")
      spy.mockClear()
      const result = dataStyleStore.setModelEdgesVisibility(id, visibility)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        model_edges_schemas.visibility,
        { id, visibility },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.modelEdgesVisibility(id)).toBe(visibility)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
  describe("Edges style", () => {
    test("Edges apply style", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const result = dataStyleStore.applyModelEdgesStyle(id)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
