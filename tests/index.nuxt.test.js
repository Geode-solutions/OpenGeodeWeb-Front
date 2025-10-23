// Node.js imports

// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "~/utils/status"
import * as composables from "~/composables/viewer_call"
import { useDataStyleStore } from "~/stores/data_style"
import { useViewerStore } from "~/stores/viewer"
import { kill_back, kill_viewer } from "~/utils/local"
import { setupIntegrationTests } from "./integration/setup.js"

// Local constants
const mesh_schemas = viewer_schemas.opengeodeweb_viewer.mesh
let id
const file_name = "edged_curve.vtp"
const geode_object = "EdgedCurve2D"
const object_type = "mesh"

beforeEach(async () => {
  id = setupIntegrationTests(id, file_name, geode_object, object_type)
  console.log("beforeEach index id", id)
})

afterEach(async () => {
  const viewerStore = useViewerStore()
  const geodeStore = useGeodeStore()
  await Promise.all([
    kill_back(geodeStore.default_local_port),
    kill_viewer(viewerStore.default_local_port),
  ])
})

describe("Mesh", () => {
  describe("Mesh visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const spy = vi.spyOn(composables, "viewer_call")
      await dataStyleStore.setMeshEdgesVisibility(id, true)
      expect(spy).toHaveBeenCalledWith(
        {
          schema: mesh_schemas.visibility,
          params: { id, color },
        },
        {
          response_function: expect.any(Function),
        },
      )
      expect(dataStyleStore.meshEdgesVisibility(id)).toBe(true)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
