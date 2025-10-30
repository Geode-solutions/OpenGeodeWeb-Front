import { beforeEach, describe, expect, test, vi } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import { useProjectManager } from "@/composables/project_manager.js"

// Mocks
const mockAppStore = {
  exportStore: vi.fn(() => ({ projectName: "mockedProject" })),
  importStore: vi.fn(),
}
const mockInfraStore = { create_connection: vi.fn() }

vi.mock("@/stores/app.js", () => ({ useAppStore: () => mockAppStore }))
vi.mock("@ogw_f/stores/infra", () => ({ useInfraStore: () => mockInfraStore }))
vi.mock("@/composables/viewer_call.js", () => ({
  default: vi.fn(),
  viewer_call: vi.fn(),
}))

vi.mock("@/stores/geode.js", () => ({
  useGeodeStore: () => ({
    base_url: "http://localhost:5000",
    start_request: vi.fn(),
    stop_request: vi.fn(),
    do_ping: vi.fn(),
  }),
}))

vi.mock(
  "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json",
  () => ({
    default: {
      opengeodeweb_back: {
        project: {
          export_project: { route: "/project/export_project", methods: ["POST"] },
        },
      },
    },
  }),
)
vi.mock(
  "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json",
  () => ({
    default: {
      opengeodeweb_viewer: {
        utils: { import_project: { rpc: "utils.import_project" } },
        viewer: { reset_visualization: { rpc: "viewer.reset_visualization" } },
      },
    },
  }),
)

beforeEach(() => setActivePinia(createPinia()))

describe("ProjectManager composable", () => {
  test("exportProject triggers download", async () => {
    const mockElement = { href: "", download: "", click: vi.fn() }
    vi.stubGlobal("document", { createElement: () => mockElement })
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:url",
      revokeObjectURL: vi.fn(),
    })
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        blob: async () =>
          new Blob(["zipcontent"], { type: "application/zip" }),
        headers: { get: () => "project_123.zip" },
      })),
    )

    const { exportProject } = useProjectManager()
    await exportProject()

    expect(mockAppStore.exportStore).toHaveBeenCalled()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(mockElement.click).toHaveBeenCalled()
  })

  test("importProjectFile loads snapshot", async () => {
    const { importProjectFile } = useProjectManager()

    const file = { text: () => Promise.resolve('{"dataBase":{"db":{}}}') }
    await importProjectFile(file)

    expect(mockInfraStore.create_connection).toHaveBeenCalled()
    expect((await import("@/composables/viewer_call.js")).viewer_call).toHaveBeenCalled()
    expect(mockAppStore.importStore).toHaveBeenCalled()
  })
})
