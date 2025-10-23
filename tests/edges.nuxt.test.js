// Node.js imports

// Third party imports
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" }

// Local imports
import Status from "~/utils/status"
import * as composables from "~/composables/viewer_call"
import { useDataStyleStore } from "~/stores/data_style"
import { useViewerStore } from "~/stores/viewer"
import { setupIntegrationTests } from "./integration/setup.js"

// Local constants
const model_edges_schemas = viewer_schemas.opengeodeweb_viewer.model.edges
let id, back_port, viewer_port
const file_name = "test.og_edc2d"
const geode_object = "EdgedCurve2D"
const object_type = "model"

beforeEach(async () => {
  ;({ id, back_port, viewer_port } = await setupIntegrationTests(
    file_name,
    geode_object,
    object_type,
  ))
}, 20000)

afterEach(async () => {
  await Promise.all([kill_back(back_port), kill_viewer(viewer_port)])
})

describe("Model edges", () => {
  describe("Edges visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore()
      const viewerStore = useViewerStore()
      await dataStyleStore.setModelEdgesVisibility(id, true)
      expect(dataStyleStore.modelEdgesVisibility(id)).toBe(true)
      expect(viewerStore.status).toBe(Status.CONNECTED)
    })
  })
})
