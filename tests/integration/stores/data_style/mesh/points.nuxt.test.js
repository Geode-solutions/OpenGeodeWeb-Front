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
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points
const file_name = "test.og_edc2d"
const geode_object = "EdgedCurve2D"
const vertex_attribute = { name: "points" }

let id, back_port, viewer_port, project_folder_path

beforeEach(async () => {
  ; ({ id, back_port, viewer_port, project_folder_path } =
    await setupIntegrationTests(file_name, geode_object))
}, 20000)

afterEach(async () => {
  console.log(
    "afterEach mesh points kill",
    back_port,
    viewer_port,
    project_folder_path,
  )
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
})

describe("Mesh points", () => {
  describe("Points visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const visibility = true
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshPointsVisibility(id, visibility)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_points_schemas.visibility,
        { id, visibility },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPointsVisibility(id)).toBe(visibility)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Points color", () => {
    test("Color red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshPointsColor(id, color)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_points_schemas.color,
        { id, color },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPointsColor(id)).toStrictEqual(color)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Points active coloring", () => {
    test("test coloring", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const coloringTypes = [
        { name: "color" },
        {
          name: "vertex",
          function: () =>
            dataStyleStore.setMeshPointsVertexAttribute(id, vertex_attribute),
        },
      ]
      for (let i = 0; i < coloringTypes.length; i++) {
        if (coloringTypes[i].function) {
          await coloringTypes[i].function()
        }
        const result = dataStyleStore.setMeshPointsActiveColoring(
          id,
          coloringTypes[i].name,
        )
        expect(result).toBeInstanceOf(Promise)
        await result
        expect(dataStyleStore.meshPointsActiveColoring(id)).toBe(
          coloringTypes[i].name,
        )
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }
    })
  })

  describe("Points size", () => {
    test("Size 20", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const size = 20
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshPointsSize(id, size)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_points_schemas.size,
        { id, size },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPointsSize(id)).toBe(size)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })

    test("Points vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()

      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setMeshPointsVertexAttribute(id, vertex_attribute)
      expect(spy).toHaveBeenCalledWith(
        mesh_points_schemas.vertex_attribute,
        { id, ...vertex_attribute },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshPointsVertexAttribute(id)).toStrictEqual(
        vertex_attribute,
      )
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  test("Points apply default style", async () => {
    const dataStyleStore = useDataStyleStore()
    const viewerStore = useViewerStore()
    const result = dataStyleStore.applyMeshPointsStyle(id)
    expect(result).toBeInstanceOf(Promise)
    await result
    expect(viewerStore.status).toBe(Status.CONNECTED)
  })
})
