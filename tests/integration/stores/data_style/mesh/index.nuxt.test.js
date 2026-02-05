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
const mesh_schemas = viewer_schemas.opengeodeweb_viewer.mesh
const file_name = "test.og_rgd3d"
const geode_object = "RegularGrid3D"

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
      const result = dataStyleStore.setMeshVisibility(id, visibility)
      expect(result).toBeInstanceOf(Promise)
      await result
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
      const result = dataStyleStore.applyMeshStyle(id)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
