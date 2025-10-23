// Node.js imports

// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "~/utils/status"
import * as composables from "~/composables/viewer_call"
import { useDataStyleStore } from "~/stores/data_style"
import { useViewerStore } from "~/stores/viewer"
import { kill_back, kill_viewer } from "~/utils/local"
import { setupIntegrationTests } from "./integration/setup.js"

// Local constants
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points
let id
const file_name = "test.og_edc2d"
const geode_object = "EdgedCurve2D"
const object_type = "mesh"

beforeEach(async () => {
  id = await setupIntegrationTests(file_name, geode_object, object_type)
  console.log("beforeEach points id", id)
}, 25000)

afterEach(async () => {
  const viewerStore = useViewerStore()
  const geodeStore = useGeodeStore()
  await Promise.all([
    kill_back(geodeStore.default_local_port),
    kill_viewer(viewerStore.default_local_port),
  ])
})

describe("Mesh points", () => {
  describe("Points visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      await dataStyleStore.setPointsVisibility(id, true)
      expect(dataStyleStore.pointsVisibility(id)).toBe(true)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Points active coloring", () => {
    test("test coloring", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const coloringTypes = ["color"]
      for (let i = 0; i < coloringTypes.length; i++) {
        dataStyleStore.setPointsActiveColoring(id, coloringTypes[i])
        expect(dataStyleStore.pointsActiveColoring(id)).toBe(coloringTypes[i])
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }
    })
  })
  describe("Points color", () => {
    test("test red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setPointsColor(id, color)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: mesh_points_schemas.color,
          params: { id, color },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.pointsColor(id)).toStrictEqual(color)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
