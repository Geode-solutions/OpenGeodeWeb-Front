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
const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges
const file_name = "test.og_edc3d"
const geode_object = "EdgedCurve3D"

let id, back_port, viewer_port, project_folder_path

beforeEach(async () => {
  ;({ id, back_port, viewer_port, project_folder_path } =
    await setupIntegrationTests(file_name, geode_object))
}, 25000)

afterEach(async () => {
  console.log(
    "afterEach mesh edges kill",
    back_port,
    viewer_port,
    project_folder_path,
  )
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
})

describe("Mesh EdgedCurve3D", () => {
  describe("Edges", () => {
    test("Edges visibility", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const visibility = true
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setMeshEdgesVisibility(id, visibility)
      expect(spy).toHaveBeenCalledWith(
        mesh_edges_schemas.visibility,
        { id, visibility },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshEdgesVisibility(id)).toBe(visibility)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })

    test("Edges color red", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const color = { r: 255, g: 0, b: 0 }
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setMeshEdgesColor(id, color)
      expect(spy).toHaveBeenCalledWith(
        mesh_edges_schemas.color,
        { id, color },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshEdgesColor(id)).toStrictEqual(color)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })

    test("Edges active coloring", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const coloringTypes = ["color", "vertex", "edge"]
      for (let i = 0; i < coloringTypes.length; i++) {
        dataStyleStore.setMeshEdgesActiveColoring(id, coloringTypes[i])
        expect(dataStyleStore.meshEdgesActiveColoring(id)).toBe(
          coloringTypes[i],
        )
        expect(viewerStore.status).toBe(Status.CONNECTED)
      }
    })

    test("Edges vertex attribute", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const vertex_attribute = { name: "vertex_attribute" }
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setMeshEdgesVertexAttribute(id, vertex_attribute)
      expect(spy).toHaveBeenCalledWith(
        mesh_edges_schemas.vertex_attribute,
        { id, ...vertex_attribute },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshEdgesVertexAttribute(id)).toStrictEqual(
        vertex_attribute,
      )
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })

    test("Edges edge attribute", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const edge_attribute = { name: "edge_attribute" }
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setMeshEdgesEdgeAttribute(id, edge_attribute)
      expect(spy).toHaveBeenCalledWith(
        mesh_edges_schemas.edge_attribute,
        { id, ...edge_attribute },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshEdgesEdgeAttribute(id)).toStrictEqual(
        edge_attribute,
      )
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
