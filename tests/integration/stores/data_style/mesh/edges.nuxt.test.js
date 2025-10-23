// Node.js imports

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
const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges
let id, back_port, viewer_port
const file_name = "test.og_edc2d"
const geode_object = "EdgedCurve2D"
const object_type = "mesh"

beforeEach(async () => {
  ;({ id, back_port, viewer_port } = await setupIntegrationTests(
    file_name,
    geode_object,
    object_type,
  ))
}, 20000)

afterEach(async () => {
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
})

describe("Mesh edges", () => {
  describe("Edges visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      await dataStyleStore.setMeshEdgesVisibility(id, true)
      expect(dataStyleStore.meshEdgesVisibility(id)).toBe(true)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
  describe("Edges active coloring", () => {
    test("test coloring", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const coloringTypes = ["color"]
      for (let i = 0; i < coloringTypes.length; i++) {
        dataStyleStore.setMeshEdgesActiveColoring(id, coloringTypes[i])
        expect(dataStyleStore.meshEdgesActiveColoring(id)).toBe(
          coloringTypes[i],
        )
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }
    })
  })
  describe("Edges color", () => {
    test("test red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setMeshEdgesColor(id, color)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: mesh_edges_schemas.color,
          params: { id, color },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshEdgesColor(id)).toStrictEqual(color)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
