import { beforeEach, describe, expect, test, vi } from "vitest"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { useProjectManager } from "@/composables/project_manager.js"

// Mocks
const mockAppStore = {
  exportStores: vi.fn(() => ({ projectName: "mockedProject" })),
  importStores: vi.fn(),
}
const mockInfraStore = { create_connection: vi.fn() }

vi.mock("@/stores/app.js", () => ({ useAppStore: () => mockAppStore }))
vi.mock("@ogw_f/stores/infra", () => ({ useInfraStore: () => mockInfraStore }))
vi.mock("@/composables/viewer_call.js", () => ({
  viewer_call: vi.fn(),
}))

beforeEach(async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  const geode_store = useGeodeStore()
  await geode_store.$reset()
  geode_store.base_url = ""
})

vi.mock("@geode/opengeodeweb-back/opengeodeweb_back_schemas.json", () => ({
  default: {
    opengeodeweb_back: {
      export_project: {
        $id: "opengeodeweb_back/export_project",
        route: "/export_project",
        methods: ["POST"],
        type: "object",
        properties: {
          snapshot: { type: "object" },
          filename: { type: "string", minLength: 1 },
        },
        required: ["snapshot", "filename"],
        additionalProperties: false,
      },
      import_project: {
        $id: "opengeodeweb_back/import_project",
        route: "/import_project",
        methods: ["POST"],
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
}))
vi.mock("@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json", () => ({
  default: {
    opengeodeweb_viewer: {
      import_project: { rpc: "utils.import_project" },
      viewer: {
        reset_visualization: { rpc: "viewer.reset_visualization" },
        update_data: { rpc: "viewer.update_data" },
      },
      mesh: {
        register: { rpc: "mesh.register" },
        points: {},
      },
      model: {
        register: { rpc: "model.register" },
        surfaces: {},
      },
    },
  },
}))
vi.mock("@/composables/api_fetch.js", () => ({
  api_fetch: vi.fn(async (_req, options = {}) => {
    const response = {
      _data: new Blob(["zipcontent"], { type: "application/zip" }),
      headers: { get: (k) => (k === "new-file-name" ? "project_123.zip" : null) },
    }
    if (options.response_function) {
      await options.response_function(response)
    }
    return response
  }),
}))
vi.stubGlobal("$fetch", vi.fn(async () => ({ snapshot: {} })))
vi.stubGlobal("useDataBaseStore", () => ({ items: {} }))

// Mock du store base de données pour éviter Object.entries(undefined)
vi.mock("@/stores/data_base.js", () => ({
  useDataBaseStore: () => ({ items: {} }),
}))
vi.mock("@ogw_f/stores/data_base", () => ({
  useDataBaseStore: () => ({ items: {} }),
}))

describe("ProjectManager composable", () => {
  test("exportProject triggers download", async () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:url")
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
  })

  test("importProjectFile loads snapshot", async () => {
    const { importProjectFile } = useProjectManager()

    const file = new Blob(['{"dataBase":{"db":{}}}'], { type: "application/json" })
    await importProjectFile(file)

    const infra_store = useInfraStore()
    const app_store = useAppStore()
    const { viewer_call } = await import("@/composables/viewer_call.js")

    expect(infra_store.create_connection).toHaveBeenCalled()
    expect(viewer_call).toHaveBeenCalled()
    expect(app_store.importStores).toHaveBeenCalled()
  })
})
