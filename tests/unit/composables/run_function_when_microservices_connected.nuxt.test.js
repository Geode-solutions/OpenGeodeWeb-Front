import { beforeEach, describe, expect, test, vi } from "vitest"
import Status from "@ogw_f/utils/status.js"

import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

beforeEach(async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
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
    // const infra_store = useInfraStore()
    // infra_store.init_microservices()
    const geode_store = useGeodeStore()
    const viewer_store = useViewerStore()
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    await geode_store.$patch({ status: Status.NOT_CONNECTED })
    await viewer_store.$patch({ status: Status.NOT_CONNECTED })
    run_function_when_microservices_connected(dumb_obj.dumb_method)
    expect(spy).not.toHaveBeenCalled()
  })
})
