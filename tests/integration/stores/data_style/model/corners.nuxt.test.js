// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "@ogw_front/utils/status"
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useDataStore } from "@ogw_front/stores/data"
import {
  delete_folder_recursive,
  kill_back,
  kill_viewer,
} from "@ogw_front/utils/local"
import { setupIntegrationTests } from "../../../setup"

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners
const file_name = "test.og_brep"
const geode_object = "BRep"

let id, back_port, viewer_port, project_folder_path

beforeEach(async () => {
  ;({ id, back_port, viewer_port, project_folder_path } =
    await setupIntegrationTests(file_name, geode_object))
}, 20000)

afterEach(async () => {
  console.log(
    "afterEach model corners kill",
    back_port,
    viewer_port,
    project_folder_path,
  )
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
})

describe("Model corners", () => {
  describe("Corners visibility", () => {
    test("Visibility false", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataStore = useDataStore()
      const corner_ids = await dataStore.getCornersGeodeIds(id)
      const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(
        id,
        corner_ids,
      )
      const visibility = false
      const spy = vi.spyOn(viewerStore, "request")
      spy.mockClear()
      await dataStyleStore.setModelCornersVisibility(id, corner_ids, visibility)
      expect(spy).toHaveBeenCalledWith(
        model_corners_schemas.visibility,
        { id, block_ids: corner_viewer_ids, visibility },
        {
          response_function: expect.any(Function),
        },
      )
      for (const corner_id of corner_ids) {
        expect(dataStyleStore.modelCornerVisibility(id, corner_id)).toBe(
          visibility,
        )
      }
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Corner color", () => {
    test("Color red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataStore = useDataStore()
      const corner_ids = await dataStore.getCornersGeodeIds(id)
      const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(
        id,
        corner_ids,
      )
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(viewerStore, "request")
      spy.mockClear()
      await dataStyleStore.setModelCornersColor(id, corner_ids, color)
      expect(spy).toHaveBeenCalledWith(
        model_corners_schemas.color,
        { id, block_ids: corner_viewer_ids, color },
        {
          response_function: expect.any(Function),
        },
      )
      for (const corner_id of corner_ids) {
        expect(dataStyleStore.modelCornerColor(id, corner_id)).toStrictEqual(
          color,
        )
      }
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
