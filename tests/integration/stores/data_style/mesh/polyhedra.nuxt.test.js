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
import { setupIntegrationTests } from "../../../setup.js"

// Local constants
const mesh_polyhedra_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra
let id, back_port, viewer_port
const file_name = "test.og_rgd3d"
const geode_object = "RegularGrid3D"
const object_type = "mesh"

beforeEach(async () => {
  ; ({ id, back_port, viewer_port } = await setupIntegrationTests(
    file_name,
    geode_object,
    object_type,
  ))
}, 20000)

afterEach(async () => {
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
})

describe("Mesh polyhedra", () => {
  describe("Polyhedra visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      await dataStyleStore.setMeshPolyhedraVisibility(id, true)
      expect(dataStyleStore.meshPolyhedraVisibility(id)).toBe(true)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
  describe("Polyhedra active coloring", () => {
    test("test coloring", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const coloringTypes = ["color"]
      for (let i = 0; i < coloringTypes.length; i++) {
        dataStyleStore.setMeshPolyhedraActiveColoring(id, coloringTypes[i])
        expect(dataStyleStore.meshPolyhedraActiveColoring(id)).toBe(
          coloringTypes[i],
        )
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }
    })
  })
  describe("Polyhedra color", () => {
    test("test red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setMeshPolyhedraColor(id, color)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: mesh_polyhedra_schemas.color,
          params: { id, color },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPolyhedraColor(id)).toStrictEqual(color)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
