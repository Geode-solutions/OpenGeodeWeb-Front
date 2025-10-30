import { beforeEach, describe, expect, test, vi } from "vitest"
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
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

describe("ProjectManager composable", () => {
  test("exportProject triggers download", async () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:url")
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["zipcontent"], { type: "application/zip" }),
      headers: { get: () => 'attachment; filename="project_123.zip"' },
      statusText: "OK",
    })

    const { exportProject } = useProjectManager()
    await exportProject()

    const app_store = useAppStore()
    expect(app_store.exportStore).toHaveBeenCalled()
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalled()
  })

  test("importProjectFile loads snapshot", async () => {
    const { importProjectFile } = useProjectManager()

    const file = { text: () => Promise.resolve('{"dataBase":{"db":{}}}') }
    await importProjectFile(file)

    const infra_store = useInfraStore()
    const app_store = useAppStore()
    const { viewer_call } = await import("@/composables/viewer_call.js")

    expect(infra_store.create_connection).toHaveBeenCalled()
    expect(viewer_call).toHaveBeenCalled()
    expect(app_store.importStore).toHaveBeenCalled()
  })
})
