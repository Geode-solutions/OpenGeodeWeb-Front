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
const mesh_cells_schemas = viewer_schemas.opengeodeweb_viewer.mesh.cells
const file_name = "test.og_rgd2d"
const geode_object = "RegularGrid2D"
const vertex_attribute = { name: "points" }
const cell_attribute = { name: "RGB_data" }

let id, back_port, viewer_port, project_folder_path

beforeEach(async () => {
  ;({ id, back_port, viewer_port, project_folder_path } =
    await setupIntegrationTests(file_name, geode_object))
}, 20000)

afterEach(async () => {
  console.log(
    "afterEach mesh cells kill",
    back_port,
    viewer_port,
    project_folder_path,
  )

  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
})

describe("Mesh cells", () => {
  describe("Cells visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const visibility = true
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshCellsVisibility(id, visibility)
      console.log("result", { result })
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_cells_schemas.visibility,
        { id, visibility },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshCellsVisibility(id)).toBe(visibility)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Cells color", () => {
    test("Color red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshCellsColor(id, color)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_cells_schemas.color,
        { id, color },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshCellsColor(id)).toStrictEqual(color)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Cells vertex attribute", () => {
    test("Coloring vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshCellsVertexAttribute(
        id,
        vertex_attribute,
      )
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_cells_schemas.vertex_attribute,
        { id, ...vertex_attribute },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshCellsVertexAttribute(id)).toStrictEqual(
        vertex_attribute,
      )
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Cells cell attribute", () => {
    test("Coloring cell attribute", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const spy = vi.spyOn(viewerStore, "request")
      const result = dataStyleStore.setMeshCellsCellAttribute(
        id,
        cell_attribute,
      )
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(spy).toHaveBeenCalledWith(
        mesh_cells_schemas.cell_attribute,
        { id, ...cell_attribute },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshCellsCellAttribute(id)).toStrictEqual(
        cell_attribute,
      )
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Cells active coloring", () => {
    test("test coloring", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const coloringTypes = [
        { name: "color" },
        {
          name: "vertex",
          function: () =>
            dataStyleStore.setMeshCellsVertexAttribute(id, vertex_attribute),
        },
        {
          name: "cell",
          function: () =>
            dataStyleStore.setMeshCellsCellAttribute(id, cell_attribute),
        },
      ]
      for (let i = 0; i < coloringTypes.length; i++) {
        if (coloringTypes[i].function) {
          expect(() =>
            dataStyleStore.setMeshCellsActiveColoring(
              id,
              coloringTypes[i].name,
            ),
          ).toThrowError()
          await coloringTypes[i].function()
        }
        const result = dataStyleStore.setMeshCellsActiveColoring(
          id,
          coloringTypes[i].name,
        )
        expect(result).toBeInstanceOf(Promise)
        await result
        expect(dataStyleStore.meshCellsActiveColoring(id)).toBe(
          coloringTypes[i].name,
        )
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }
    })
  })
})
