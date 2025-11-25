import { beforeEach, describe, expect, test, vi } from "vitest"
import Status from "@ogw_front/utils/status.js"
import { registerMicroservice } from "@ogw_front/stores/infra.js"

import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

beforeEach(async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
  
  registerMicroservice({
    name: "geode",
    useStore: useGeodeStore,
    connect: (store) => store.do_ping(),
    electron_runner: "run_back",
  })
  registerMicroservice({
    name: "viewer",
    useStore: useViewerStore,
    connect: (store) => store.ws_connect(),
    electron_runner: "run_viewer",
  })
})

describe("run_function_when_microservices_connected", () => {
  const dumb_obj = { dumb_method: () => true }

  beforeEach(async () => {
    const geode_store = useGeodeStore()
    const viewer_store = useViewerStore()
    await geode_store.$patch({ status: Status.NOT_CONNECTED })
    await viewer_store.$patch({ status: Status.NOT_CONNECTED })
  })
  test("microservices connected", async () => {
    const geode_store = useGeodeStore()
    const viewer_store = useViewerStore()
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    run_function_when_microservices_connected(dumb_obj.dumb_method)
    await geode_store.$patch({ status: Status.CONNECTED })
    await viewer_store.$patch({ status: Status.CONNECTED })
    expect(spy).toHaveBeenCalled()
  })

  test("microservices not connected", async () => {
    const geode_store = useGeodeStore()
    const viewer_store = useViewerStore()
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    run_function_when_microservices_connected(dumb_obj.dumb_method)
    await geode_store.$patch({ status: Status.NOT_CONNECTED })
    await viewer_store.$patch({ status: Status.NOT_CONNECTED })
    expect(spy).not.toHaveBeenCalled()
  })
})
