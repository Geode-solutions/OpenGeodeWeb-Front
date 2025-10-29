// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "~/utils/status"
import * as composables from "~/composables/viewer_call"
import { useDataStyleStore } from "~/stores/data_style"
import { useViewerStore } from "~/stores/viewer"
import { kill_back, kill_viewer } from "~/utils/local"
import { setupIntegrationTests } from "../../../setup.js"

// Local constants
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points
const file_name = "test.og_edc2d"
const geode_object = "EdgedCurve2D"

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

describe("Mesh points", () => {
  describe("Points visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const visibility = true
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setMeshPointsVisibility(id, visibility)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: mesh_points_schemas.visibility,
          params: { id, visibility },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPointsVisibility(id)).toBe(visibility)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Points active coloring", () => {
    test("test coloring", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const coloringTypes = ["color"]
      for (let i = 0; i < coloringTypes.length; i++) {
        dataStyleStore.setMeshPointsActiveColoring(id, coloringTypes[i])
        expect(dataStyleStore.meshPointsActiveColoring(id)).toBe(
          coloringTypes[i],
        )
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }
    })
  })
  describe("Points color", () => {
    test("Color red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setMeshPointsColor(id, color)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: mesh_points_schemas.color,
          params: { id, color },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPointsColor(id)).toStrictEqual(color)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Points size", () => {
    test("Size 20", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const size = 20
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setMeshPointsSize(id, size)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: mesh_points_schemas.size,
          params: { id, size },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPointsSize(id)).toBe(size)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
