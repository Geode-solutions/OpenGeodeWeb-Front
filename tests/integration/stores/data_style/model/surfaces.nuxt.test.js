// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import { Status } from "@ogw_front/utils/status"
import { cleanupBackend } from "@ogw_front/utils/local/cleanup"
import { setupIntegrationTests } from "@ogw_tests/integration/setup"
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const INTERVAL_TIMEOUT = 20_000
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces
const file_name = "test.og_brep"
const geode_object = "BRep"

let id = "",
  projectFolderPath = ""

beforeEach(async () => {
  ;({ id, projectFolderPath } = await setupIntegrationTests(
    file_name,
    geode_object,
  ))
}, INTERVAL_TIMEOUT)

afterEach(async () => {
  console.log("afterEach model surfaces kill", projectFolderPath)
  await cleanupBackend(projectFolderPath)
})
describe("model surfaces", () => {
  describe("surfaces visibility", () => {
    test("visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataStore = useDataStore()
      const surface_ids = await dataStore.getSurfacesGeodeIds(id)
      const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(
        id,
        surface_ids,
      )
      const visibility = true
      const spy = vi.spyOn(viewerStore, "request")
      spy.mockClear()
      const result = dataStyleStore.setModelSurfacesVisibility(
        id,
        surface_ids,
        visibility,
      )
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        model_surfaces_schemas.visibility,
        { id, block_ids: surface_viewer_ids, visibility },
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

  describe("surfaces color", () => {
    test("color red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const dataStore = useDataStore()
      const surface_ids = await dataStore.getSurfacesGeodeIds(id)
      const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(
        id,
        surface_ids,
      )
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(viewerStore, "request")
      spy.mockClear()
      const result = dataStyleStore.setModelSurfacesColor(
        id,
        surface_ids,
        color,
      )
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        model_surfaces_schemas.color,
        { id, block_ids: surface_viewer_ids, color },
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
  describe("Surfaces style", () => {
    test("Surfaces apply style", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const result = dataStyleStore.applyModelSurfacesStyle(id)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
