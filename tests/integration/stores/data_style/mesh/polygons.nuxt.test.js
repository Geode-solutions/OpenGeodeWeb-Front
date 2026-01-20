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
const mesh_polygons_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polygons
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points
const file_name = "test.og_psf3d"
const geode_object = "PolygonalSurface3D"

let id, back_port, viewer_port, project_folder_path

beforeEach(async () => {
  ;({ id, back_port, viewer_port, project_folder_path } =
    await setupIntegrationTests(file_name, geode_object))
}, 25000)

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
      await dataStyleStore.setMeshPolygonsVisibility(id, visibility)
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
      await dataStyleStore.setMeshPolygonsColor(id, color)
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

  describe("Polygons active coloring", () => {
    test("test coloring", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const coloringTypes = ["color", "vertex", "polygon"]
      for (let i = 0; i < coloringTypes.length; i++) {
        dataStyleStore.setMeshPolygonsActiveColoring(id, coloringTypes[i])
        expect(dataStyleStore.meshPolygonsActiveColoring(id)).toBe(
          coloringTypes[i],
        )
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }
    })
  })

  describe("Polygons vertex attribute", () => {
    test("Coloring vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const vertex_attribute = { name: "points" }
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setMeshPolygonsVertexAttribute(id, vertex_attribute)
      expect(spy).toHaveBeenCalledWith(
        mesh_polygons_schemas.vertex_attribute,
        { id, ...vertex_attribute },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPolygonsVertexAttribute(id)).toStrictEqual(
        vertex_attribute,
      )
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Polygons polygon attribute", () => {
    test("Coloring polygon attribute", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const polygon_attribute = { name: "test_attribute" }
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setMeshPolygonsPolygonAttribute(
        id,
        polygon_attribute,
      )
      expect(spy).toHaveBeenCalledWith(
        mesh_polygons_schemas.polygon_attribute,
        { id, ...polygon_attribute },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPolygonsPolygonAttribute(id)).toStrictEqual(
        polygon_attribute,
      )
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
