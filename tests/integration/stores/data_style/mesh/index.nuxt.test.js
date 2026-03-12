// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import { cleanupBackend } from "@ogw_front/utils/local/microservices"
import { Status } from "@ogw_front/utils/status"
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { setupIntegrationTests } from "@ogw_tests/integration/setup"

// Local constants
const INTERVAL_TIMEOUT = 20_000
const mesh_schemas = viewer_schemas.opengeodeweb_viewer.mesh
const file_name = "test.og_rgd3d"
const geode_object = "RegularGrid3D"

let id = "",
  projectFolderPath = ""

beforeEach(async () => {
  ;({ id, projectFolderPath } = await setupIntegrationTests(
    file_name,
    geode_object,
  ))
}, INTERVAL_TIMEOUT)

afterEach(async () => {
  console.log("afterEach mesh index kill", projectFolderPath)
  await cleanupBackend(projectFolderPath)
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
    test("Apply mesh default style", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const result = dataStyleStore.applyMeshStyle(id)
      expect(result).toBeInstanceOf(Promise)
      await result
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
