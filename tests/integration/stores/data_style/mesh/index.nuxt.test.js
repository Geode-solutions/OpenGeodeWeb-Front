// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "~/utils/status"
import * as composables from "~/composables/viewer_call"
import { useDataStyleStore } from "~/stores/data_style"
import { useViewerStore } from "~/stores/viewer"
import { kill_back, kill_viewer } from "~/utils/local"
import { setupIntegrationTests } from "../../../setup.js"

// Local constants
const mesh_schemas = viewer_schemas.opengeodeweb_viewer.mesh
const file_name = "test.og_rgd3d"
const geode_object = "RegularGrid3D"

let id, back_port, viewer_port

beforeEach(async () => {
  ;({ id, back_port, viewer_port } = await setupIntegrationTests(
    file_name,
    geode_object,
  ))
}, 20000)

afterEach(async () => {
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
})

describe("Mesh", () => {
  describe("Mesh visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      const visibility = true
      await dataStyleStore.setMeshVisibility(id, visibility)
      const spy = vi.spyOn(composables, "viewer_call")
      expect(spy).toHaveBeenCalledWith(
        {
          schema: mesh_schemas.visibility,
          params: { id, visibility },
        },
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
      await dataStyleStore.applyMeshDefaultStyle(id)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
