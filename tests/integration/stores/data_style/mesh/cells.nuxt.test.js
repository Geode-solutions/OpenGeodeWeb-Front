// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "@ogw_front/utils/status"
import {
  delete_folder_recursive,
  kill_back,
  kill_viewer,
} from "@ogw_front/utils/local"
import { setupIntegrationTests } from "../../../setup.js"

// Local constants
const mesh_cells_schemas = viewer_schemas.opengeodeweb_viewer.mesh.cells
const file_name = "test.og_rgd2d"
const geode_object = "RegularGrid2D"

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
      await dataStyleStore.setMeshCellsVisibility(id, visibility)
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
      await dataStyleStore.setMeshCellsColor(id, color)
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
      const vertex_attribute = { name: "points" }
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setMeshCellsVertexAttribute(id, vertex_attribute)
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
      const cell_attribute = { name: "RGB_data" }
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setMeshCellsCellAttribute(id, cell_attribute)
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
      const coloringTypes = ["color", "vertex", "cell"]
      for (let i = 0; i < coloringTypes.length; i++) {
        dataStyleStore.setMeshCellsActiveColoring(id, coloringTypes[i])
        expect(dataStyleStore.meshCellsActiveColoring(id)).toBe(
          coloringTypes[i],
        )
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }
    })
  })
})
