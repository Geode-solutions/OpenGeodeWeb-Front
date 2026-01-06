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
const model_lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines
const file_name = "test.og_brep"
const geode_object = "BRep"

let id, back_port, viewer_port, project_folder_path

beforeEach(async () => {
  ; ({ id, back_port, viewer_port, project_folder_path } =
    await setupIntegrationTests(file_name, geode_object))
}, 20000)

afterEach(async () => {
  console.log("afterEach model lines kill", back_port, viewer_port)
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
})

describe("Model lines", () => {
  describe("Lines visibility", () => {
    test("Visibility false", async () => {
      console.log("FROM TEST MODEL LINES")
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataStore = useDataStore()
      const line_ids = dataStore.getLinesUuids(id)
      const lines_flat_indexes = dataStore.getFlatIndexes(id, line_ids)
      const visibility = false
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setModelLinesVisibility(id, line_ids, visibility)
      expect(spy).toHaveBeenCalledWith(
        model_lines_schemas.visibility,
        { id, block_ids: lines_flat_indexes, visibility },
        {
          response_function: expect.any(Function),
        },
      )
      for (const line_id of line_ids) {
        expect(dataStyleStore.modelLineVisibility(id, line_id)).toBe(visibility)
      }
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Lines color", () => {
    test("Color red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataStore = useDataStore()
      const line_ids = dataStore.getLinesUuids(id)
      const lines_flat_indexes = dataStore.getFlatIndexes(id, line_ids)
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setModelLinesColor(id, line_ids, color)
      expect(spy).toHaveBeenCalledWith(
        model_lines_schemas.color,
        { id, block_ids: lines_flat_indexes, color },
        {
          response_function: expect.any(Function),
        },
      )
      for (const line_id of line_ids) {
        expect(dataStyleStore.modelLineColor(id, line_id)).toStrictEqual(color)
      }
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
