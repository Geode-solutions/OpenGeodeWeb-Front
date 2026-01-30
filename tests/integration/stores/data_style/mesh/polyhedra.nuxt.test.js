// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "@ogw_front/utils/status"
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useViewerStore } from "@ogw_front/stores/viewer"
import {
  delete_folder_recursive,
  kill_back,
  kill_viewer,
} from "@ogw_front/utils/local"
import { setupIntegrationTests } from "../../../setup"

// Local constants
const mesh_polyhedra_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra
const mesh_polygons_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polygons
const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges
const file_name = "test.vtu"
const geode_object = "HybridSolid3D"

let id, back_port, viewer_port, project_folder_path

beforeEach(async () => {
  ;({ id, back_port, viewer_port, project_folder_path } =
    await setupIntegrationTests(file_name, geode_object))
}, 20000)

afterEach(async () => {
  console.log(
    "afterEach mesh polyhedra kill",
    back_port,
    viewer_port,
    project_folder_path,
  )
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
})

describe("Mesh polyhedra", () => {
  describe("Polyhedra", () => {
    test("Polyhedra visibility", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const visibility = true
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshPolyhedraVisibility(id, visibility)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_polyhedra_schemas.visibility,
        { id, visibility },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPolyhedraVisibility(id)).toBe(visibility)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })

    test("Polyhedra color red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshPolyhedraColor(id, color)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_polyhedra_schemas.color,
        { id, color },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPolyhedraColor(id)).toStrictEqual(color)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })

    test("Polyhedra active coloring", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const coloringTypes = ["color", "vertex", "polyhedron"]
      for (let i = 0; i < coloringTypes.length; i++) {
        dataStyleStore.setMeshPolyhedraActiveColoring(id, coloringTypes[i])
        expect(dataStyleStore.meshPolyhedraActiveColoring(id)).toBe(
          coloringTypes[i],
        )
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }
    })

    test("Polyhedra vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const vertex_attribute = { name: "toto_on_vertices" }
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setPolyhedraVertexAttribute(id, vertex_attribute)
      expect(spy).toHaveBeenCalledWith(
        mesh_polyhedra_schemas.vertex_attribute,
        { id, ...vertex_attribute },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.polyhedraVertexAttribute(id)).toStrictEqual(
        vertex_attribute,
      )
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })

    test("Polyhedra polyhedron attribute", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const polyhedron_attribute = { name: "toto_on_polyhedra" }
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setPolyhedraPolyhedronAttribute(
        id,
        polyhedron_attribute,
      )
      expect(spy).toHaveBeenCalledWith(
        mesh_polyhedra_schemas.polyhedron_attribute,
        { id, ...polyhedron_attribute },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.polyhedraPolyhedronAttribute(id)).toStrictEqual(
        polyhedron_attribute,
      )
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
