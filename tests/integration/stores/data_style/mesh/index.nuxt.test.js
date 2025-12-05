// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "@ogw_front/utils/status"
import { useDataStyleStore } from "@ogw_front/stores/data_style.js"
import { useViewerStore } from "@ogw_front/stores/viewer.js"
import {
  delete_folder_recursive,
  kill_back,
  kill_viewer,
} from "@ogw_front/utils/local"
import { setupIntegrationTests } from "../../../setup.js"

// Local constants
const mesh_schemas = viewer_schemas.opengeodeweb_viewer.mesh
const file_name = "test.og_rgd3d"
const geode_object = "RegularGrid3D"

let id, back_port, viewer_port, project_folder_path

beforeEach(async () => {
  ;({ id, back_port, viewer_port, project_folder_path } =
    await setupIntegrationTests(file_name, geode_object))
}, 20000)

afterEach(async () => {
  console.log(
    "afterEach mesh index kill",
    back_port,
    viewer_port,
    project_folder_path,
  )
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
  delete_folder_recursive(project_folder_path)
})

describe("Mesh", () => {
  describe("Mesh visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const visibility = true
      const spy = vi.spyOn(viewerStore, "request")
      await dataStyleStore.setMeshVisibility(id, visibility)
      expect(spy).toHaveBeenCalledWith(
        mesh_schemas.visibility,
        { id, visibility },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshVisibility(id)).toBe(visibility)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })

  describe("Apply mesh default style", () => {
    test("test", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      await dataStyleStore.applyMeshStyle(id)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
