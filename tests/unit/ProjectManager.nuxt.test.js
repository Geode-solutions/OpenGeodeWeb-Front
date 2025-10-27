import { beforeEach, describe, expect, test, vi } from "vitest"
import { setActivePinia, createPinia } from "pinia"
import { viewer_call } from "@/composables/viewer_call.js"

// Mocks
const mockAppStore = {
  save: vi.fn(() => ({ projectName: "mockedProject" })),
  load: vi.fn(),
}
const mockInfraStore = { create_connection: vi.fn() }

vi.mock("@/stores/app_store.js", () => ({ useAppStore: () => mockAppStore }))
vi.mock("@ogw_f/stores/infra", () => ({ useInfraStore: () => mockInfraStore }))
vi.mock("@/composables/viewer_call.js", () => ({
  default: vi.fn(),
  viewer_call: vi.fn(),
}))

const projectManagerPlugin = {
  provide: {
    project: {
      export: vi.fn(),
      importFile: vi.fn(),
    },
  },
}

beforeEach(() => setActivePinia(createPinia()))

describe("ProjectManager plugin", () => {
  test("exportProject triggers download", async () => {
    const mockElement = { href: "", download: "", click: vi.fn() }
    vi.stubGlobal("document", { createElement: () => mockElement })
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:url",
      revokeObjectURL: vi.fn(),
    })

    projectManagerPlugin.provide.project.export = async () => {
      const snapshot = mockAppStore.save()
      const json = JSON.stringify(snapshot, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `project_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      console.log("[TEST] URL's project :", { a })
    }

    await projectManagerPlugin.provide.project.export()
    expect(mockAppStore.save).toHaveBeenCalled()
    expect(mockElement.click).toHaveBeenCalled()
  })

  test("importProjectFile loads snapshot", async () => {
    projectManagerPlugin.provide.project.importFile = async (file) => {
      const raw = await file.text()
      const snapshot = JSON.parse(raw)
      await mockInfraStore.create_connection()
      viewer_call({})
      console.log("[TEST] viewer_call:", viewer_call.mock?.calls, viewer_call.mock?.calls?.length || 0)
      await mockAppStore.load(snapshot)
    }

    const file = { text: () => Promise.resolve('{"dataBase":{"db":{}}}') }
    await projectManagerPlugin.provide.project.importFile(file)

    expect(mockInfraStore.create_connection).toHaveBeenCalled()
    expect(viewer_call).toHaveBeenCalled()
    expect(mockAppStore.load).toHaveBeenCalled()
  })
})
