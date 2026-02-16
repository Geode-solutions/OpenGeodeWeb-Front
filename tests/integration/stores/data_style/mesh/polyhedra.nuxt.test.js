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
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const INTERVAL_TIMEOUT = 20000
const mesh_polyhedra_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra
const file_name = "test.vtu"
const geode_object = "HybridSolid3D"
const vertex_attribute = { name: "toto_on_vertices" }
const polyhedron_attribute = { name: "toto_on_polyhedra" }

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
      const coloringTypes = [
        { name: "color" },
        {
          name: "vertex",
          function: () =>
            dataStyleStore.setMeshPolyhedraVertexAttributeName(
              id,
              vertex_attribute.name,
            ),
        },
        {
          name: "polyhedron",
          function: () =>
            dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(
              id,
              polyhedron_attribute.name,
            ),
        },
      ]
      async function testColoring(coloringType, expectedColoringType) {
        if (coloringType.function) {
          await coloringType.function()
        }
        const result = dataStyleStore.setMeshPolyhedraActiveColoring(
          id,
          coloringType.name,
        )
        expect(result).toBeInstanceOf(Promise)
        await result
        expect(dataStyleStore.meshPolyhedraActiveColoring(id)).toBe(
          expectedColoringType,
        )
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }

      await testColoring(coloringTypes[0], "color")
      await testColoring(coloringTypes[1], "vertex")
      await testColoring(coloringTypes[2], "polyhedron")
    })
  })

  test("Polyhedra vertex attribute", async () => {
    const dataStyleStore = useDataStyleStore()
    const viewerStore = useViewerStore()

    const spy = vi.spyOn(viewerStore, "request")
    await dataStyleStore.setMeshPolyhedraVertexAttributeName(
      id,
      vertex_attribute.name,
    )
    expect(spy).toHaveBeenCalledWith(
      mesh_polyhedra_schemas.attribute.vertex.name,
      { id, ...vertex_attribute },
      {
        response_function: expect.any(Function),
      },
    )
    expect(dataStyleStore.meshPolyhedraVertexAttributeName(id)).toBe(
      vertex_attribute.name,
    )
    expect(viewerStore.status).toBe(Status.CONNECTED)
  })

  test("Polyhedra polyhedron attribute", async () => {
    const dataStyleStore = useDataStyleStore()
    const viewerStore = useViewerStore()

    const spy = vi.spyOn(viewerStore, "request")
    await dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(
      id,
      polyhedron_attribute.name,
    )
    expect(spy).toHaveBeenCalledWith(
      mesh_polyhedra_schemas.attribute.polyhedron.name,
      { id, ...polyhedron_attribute },
      {
        response_function: expect.any(Function),
      },
    )
    expect(dataStyleStore.meshPolyhedraPolyhedronAttributeName(id)).toBe(
      polyhedron_attribute.name,
    )
    expect(viewerStore.status).toBe(Status.CONNECTED)
  })

  test("Polyhedra apply default style", async () => {
    const dataStyleStore = useDataStyleStore()
    const viewerStore = useViewerStore()
    const result = dataStyleStore.applyMeshPolyhedraStyle(id)
    expect(result).toBeInstanceOf(Promise)
    await result
    expect(viewerStore.status).toBe(Status.CONNECTED)
  })
})
