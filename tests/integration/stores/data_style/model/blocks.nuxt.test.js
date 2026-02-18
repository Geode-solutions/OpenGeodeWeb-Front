// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import {
  delete_folder_recursive,
  kill_back,
  kill_viewer,
} from "@ogw_front/utils/local"
import Status from "@ogw_front/utils/status"
import { setupIntegrationTests } from "../../../setup"
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const INTERVAL_TIMEOUT = 20_000
const model_blocks_schemas = viewer_schemas.opengeodeweb_viewer.model.blocks
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
    "afterEach model blocks kill",
    back_port,
    viewer_port,
    project_folder_path,
  )
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
})

describe("Model blocks", () => {
  describe("Blocks visibility", () => {
    test("Visibility false", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataStore = useDataStore()
      const block_ids = await dataStore.getBlocksGeodeIds(id)
      const block_viewer_ids = await dataStore.getMeshComponentsViewerIds(
        id,
        block_ids,
      )
      const visibility = false
      const spy = vi.spyOn(viewerStore, "request")
      spy.mockClear()
      const result = dataStyleStore.setModelBlocksVisibility(
        id,
        block_ids,
        visibility,
      )
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        model_blocks_schemas.visibility,
        { id, block_ids: block_viewer_ids, visibility },
        {
          response_function: expect.any(Function),
        },
      )
      for (const block_id of block_ids) {
        expect(dataStyleStore.modelBlockVisibility(id, block_id)).toBe(
          visibility,
        )
      }
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Blocks color", () => {
    test("Color red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataStore = useDataStore()
      const block_ids = await dataStore.getBlocksGeodeIds(id)
      const block_viewer_ids = await dataStore.getMeshComponentsViewerIds(
        id,
        block_ids,
      )
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setModelBlocksColor(id, block_ids, color)
      expect(spy).toHaveBeenCalledWith(
        model_blocks_schemas.color,
        { id, block_ids: block_viewer_ids, color },
        {
          response_function: expect.any(Function),
        },
      )
      for (const block_id of block_ids) {
        expect(dataStyleStore.modelBlockColor(id, block_id)).toStrictEqual(
          color,
        )
      }
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
  describe("Blocks style", () => {
    test("Blocks apply style", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const result = dataStyleStore.applyModelBlocksStyle(id)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
