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
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces
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

describe("Model surfaces", () => {
  describe("Surfaces visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataBaseStore = useDataBaseStore()
      const surface_ids = dataBaseStore.getSurfacesUuids(id)
      const surface_flat_indexes = dataBaseStore.getFlatIndexes(id, surface_ids)
      const visibility = true
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setModelSurfacesVisibility(
        id,
        surface_ids,
        visibility,
      )
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_surfaces_schemas.visibility,
          params: { id, block_ids: surface_flat_indexes, visibility },
        },
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
      const dataBaseStore = useDataBaseStore()
      const surface_ids = dataBaseStore.getSurfacesUuids(id)
      const surface_flat_indexes = dataBaseStore.getFlatIndexes(id, surface_ids)
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setModelSurfacesColor(id, surface_ids, color)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: model_surfaces_schemas.color,
          params: { id, block_ids: surface_flat_indexes, color },
        },
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
