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
const mesh_polygons_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polygons
const file_name = "test.og_psf3d"
const geode_object = "PolygonalSurface3D"
const vertex_attribute = { name: "points" }
const polygon_attribute = { name: "test_attribute" }

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
    "afterEach mesh polygons kill",
    back_port,
    viewer_port,
    project_folder_path,
  )

  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
})

describe("Mesh polygons", () => {
  describe("Polygons visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const visibility = true
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshPolygonsVisibility(id, visibility)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_polygons_schemas.visibility,
        { id, visibility },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPolygonsVisibility(id)).toBe(visibility)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Polygons color", () => {
    test("Color red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshPolygonsColor(id, color)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_polygons_schemas.color,
        { id, color },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPolygonsColor(id)).toStrictEqual(color)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Polygons vertex attribute", () => {
    test("Coloring vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshPolygonsVertexAttributeName(
        id,
        vertex_attribute.name,
      )
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_polygons_schemas.attribute.vertex.name,
        { id, ...vertex_attribute },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPolygonsVertexAttributeName(id)).toBe(
        vertex_attribute.name,
      )
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Polygons polygon attribute", () => {
    test("Coloring polygon attribute", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshPolygonsPolygonAttributeName(
        id,
        polygon_attribute.name,
      )
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_polygons_schemas.attribute.polygon.name,
        { id, ...polygon_attribute },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPolygonsPolygonAttributeName(id)).toBe(
        polygon_attribute.name,
      )
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Polygons active coloring", () => {
    test("test coloring", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const coloringTypes = [
        { name: "color" },
        {
          name: "vertex",
          function: () =>
            dataStyleStore.setMeshPolygonsVertexAttributeName(
              id,
              vertex_attribute.name,
            ),
        },
        {
          name: "polygon",
          function: () =>
            dataStyleStore.setMeshPolygonsPolygonAttributeName(
              id,
              polygon_attribute.name,
            ),
        },
      ]

      async function testColoring(coloringType, expectedColoringType) {
        if (coloringType.function) {
          await coloringType.function()
        }
        const result = dataStyleStore.setMeshPolygonsActiveColoring(
          id,
          coloringType.name,
        )
        expect(result).toBeInstanceOf(Promise)
        await result
        expect(dataStyleStore.meshPolygonsActiveColoring(id)).toBe(
          expectedColoringType,
        )
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }

      await testColoring(coloringTypes[0], "color")
      await testColoring(coloringTypes[1], "vertex")
      await testColoring(coloringTypes[2], "polygon")
    })
  })

  test("Polygons apply default style", async () => {
    const dataStyleStore = useDataStyleStore()
    const viewerStore = useViewerStore()
    const result = dataStyleStore.applyMeshPolygonsStyle(id)
    expect(result).toBeInstanceOf(Promise)
    await result
    expect(viewerStore.status).toBe(Status.CONNECTED)
  })
})
