// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "@ogw_front/utils/status"
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useDataStore } from "@ogw_front/stores/data"
import { useViewerStore } from "@ogw_front/stores/viewer"
import {
  delete_folder_recursive,
  kill_back,
  kill_viewer,
} from "@ogw_front/utils/local"
import { setupIntegrationTests } from "../../../setup"

// Local constants
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces
const file_name = "test.og_brep"
const geode_object = "BRep"

let id, back_port, viewer_port, project_folder_path

beforeEach(async () => {
  ; ({ id, back_port, viewer_port, project_folder_path } =
    await setupIntegrationTests(file_name, geode_object))
}, 20000)

afterEach(async () => {
  console.log(
    "afterEach model surfaces kill",
    back_port,
    viewer_port,
    project_folder_path,
  )
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
})

describe("Model surfaces", () => {
  describe("Surfaces visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataStore = useDataStore()
      const surface_ids = dataStore.getSurfacesUuids(id)
      const surface_flat_indexes = dataStore.getFlatIndexes(id, surface_ids)
      const visibility = true
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setModelSurfacesVisibility(
        id,
        surface_ids,
        visibility,
      )
      expect(spy).toHaveBeenCalledWith(
        model_surfaces_schemas.visibility,
        { id, block_ids: surface_flat_indexes, visibility },
        {
          response_function: expect.any(Function),
        },
      )
      for (const surface_id of surface_ids) {
        expect(dataStyleStore.modelSurfaceVisibility(id, surface_id)).toBe(
          visibility,
        )
      }
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Surfaces color", () => {
    test("Color red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataStore = useDataStore()
      const surface_ids = dataStore.getSurfacesUuids(id)
      const surface_flat_indexes = dataStore.getFlatIndexes(id, surface_ids)
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setModelSurfacesColor(id, surface_ids, color)
      expect(spy).toHaveBeenCalledWith(
        model_surfaces_schemas.color,
        { id, block_ids: surface_flat_indexes, color },
        {
          response_function: expect.any(Function),
        },
      )
      for (const surface_id of surface_ids) {
        expect(dataStyleStore.modelSurfaceColor(id, surface_id)).toStrictEqual(
          color,
        )
      }
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
