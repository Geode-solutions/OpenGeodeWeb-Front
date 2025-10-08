// Global imports

// Third party imports
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import Status from "@ogw_f/utils/status"
import * as composables from "@ogw_f/composables/viewer_call"
import { useDataStyleStore } from "@ogw_f/stores/data_style"
import { useViewerStore } from "@ogw_f/stores/viewer"
import { setupTests } from "../setup.test.js"

// Local constants
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces
const id = "fake_id"
const file_name = "edged_curve.vtp"
const geode_object = "EdgedCurve2D"
const object_type = "mesh"

beforeEach(async () => {
  setupTests(id, file_name, geode_object, object_type)
})

afterEach(async () => {
  await kill_processes()
})

describe("Model surfaces", () => {
  describe("Visibility", () => {
    test("true", async () => {
      expect(true).toBe(true)
    })
  })
})
