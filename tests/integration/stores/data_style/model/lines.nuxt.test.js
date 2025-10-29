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
const model_lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines
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

describe("Model lines", () => {
  describe("Lines visibility", () => {
    test("Visibility false", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataBaseStore = useDataBaseStore()
      const line_ids = dataBaseStore.getLinesUuids(id)
      const line_flat_indexes = dataBaseStore.getFlatIndexes(id, line_ids)
      const visibility = false
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setModelLinesVisibility(id, line_ids, visibility)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_lines_schemas.visibility,
          params: { id, line_ids: line_flat_indexes, visibility },
        },
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
      const dataBaseStore = useDataBaseStore()
      const line_ids = dataBaseStore.getLinesUuids(id)
      const line_flat_indexes = dataBaseStore.getFlatIndexes(id, line_ids)
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setModelLinesColor(id, line_ids, color)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_lines_schemas.color,
          params: { id, line_ids: line_flat_indexes, color },
        },
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
