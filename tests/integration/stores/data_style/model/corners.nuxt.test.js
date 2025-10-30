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
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners
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
  console.log("afterEach model corners kill", back_port, viewer_port)
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
})

describe("Model corners", () => {
  describe("Corners visibility", () => {
    test("Visibility false", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataBaseStore = useDataBaseStore()
      const corner_ids = dataBaseStore.getCornersUuids(id)
      const corner_flat_indexes = dataBaseStore.getFlatIndexes(id, corner_ids)
      const visibility = false
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setModelCornersVisibility(id, corner_ids, visibility)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_corners_schemas.visibility,
          params: { id, block_ids: corner_flat_indexes, visibility },
        },
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
      const dataBaseStore = useDataBaseStore()
      const corner_ids = dataBaseStore.getCornersUuids(id)
      const corner_flat_indexes = dataBaseStore.getFlatIndexes(id, corner_ids)
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setModelCornersColor(id, corner_ids, color)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_corners_schemas.color,
          params: { id, block_ids: corner_flat_indexes, color },
        },
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
