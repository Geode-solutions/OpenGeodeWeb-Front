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
const model_blocks_schemas = viewer_schemas.opengeodeweb_viewer.model.blocks
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
  console.log("afterEach model blocks kill", back_port, viewer_port)
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
})

describe("Model blocks", () => {
  describe("Blocks visibility", () => {
    test("Visibility false", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataBaseStore = useDataBaseStore()
      const block_ids = dataBaseStore.getBlocksUuids(id)
      const block_flat_indexes = dataBaseStore.getFlatIndexes(id, block_ids)
      const visibility = false
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setModelBlocksVisibility(id, block_ids, visibility)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_blocks_schemas.visibility,
          params: { id, block_ids: block_flat_indexes, visibility },
        },
        {
          response_function: expect.any(Function),
        },
      )
      console.log("test", { id }, { block_ids })
      for (const block_id of block_ids) {
        console.log("test", { block_id })
        console.log("test", dataStyleStore.modelBlockVisibility(id, block_id))

        expect(dataStyleStore.modelBlockVisibility(id, block_id)).toBe(
          visibility,
        )
      }
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  // describe("Blocks color", () => {
  //   test("Color red", async () => {
  //     const dataStyleStore = useDataStyleStore()
  //     const viewerStore = useViewerStore()
  //     const dataBaseStore = useDataBaseStore()
  //     const block_ids = dataBaseStore.getBlocksUuids(id)
  //     const block_flat_indexes = dataBaseStore.getFlatIndexes(id, block_ids)
  //     const color = { r: 255, g: 0, b: 0 }
  //     const spy = vi.spyOn(composables, "viewer_call")
  //     await dataStyleStore.setModelBlocksColor(id, block_ids, color)
  //     expect(spy).toHaveBeenCalledWith(
  //       {
  //         schema: model_blocks_schemas.color,
  //         params: { id, block_ids: block_flat_indexes, color },
  //       },
  //       {
  //         response_function: expect.any(Function),
  //       },
  //     )
  //     for (const block_id of block_ids) {
  //       expect(dataStyleStore.modelBlockColor(id, block_id)).toStrictEqual(
  //         color,
  //       )
  //     }
  //     expect(viewerStore.status).toBe(Status.CONNECTED)
  //   })
  // })
})
