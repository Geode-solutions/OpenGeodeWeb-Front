// Third party imports
import { flushPromises } from "@vue/test-utils"
import { beforeEach, describe, expect, test, vi } from "vitest"

// Local imports
import { run_function_when_microservices_connected } from "@ogw_front/composables/run_function_when_microservices_connected"
import { setupActivePinia } from "../../utils"
import Status from "@ogw_front/utils/status"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useViewerStore } from "@ogw_front/stores/viewer"

const dumb_obj = { dumb_method: () => true }
let infraStore
let geodeStore
let viewerStore

beforeEach(() => {
  setupActivePinia()
  infraStore = useInfraStore()
  geodeStore = useGeodeStore()
  viewerStore = useViewerStore()

  // Register microservices in infra store
  infraStore.register_microservice(geodeStore, {
    request: vi.fn(),
    connect: vi.fn(),
    launch: vi.fn(),
  })
  infraStore.register_microservice(viewerStore, {
    request: vi.fn(),
    connect: vi.fn(),
    launch: vi.fn(),
  })

  geodeStore.$patch({ status: Status.NOT_CONNECTED })
  viewerStore.$patch({ status: Status.NOT_CONNECTED })
})

describe("when_microservices_connected_run_function", () => {

  test("microservices not connected", async () => {
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    run_function_when_microservices_connected(dumb_obj.dumb_method)
    geodeStore.$patch({ status: Status.NOT_CONNECTED })
    viewerStore.$patch({ status: Status.NOT_CONNECTED })
    expect(spy).not.toHaveBeenCalled()
  })

  test("microservices connected", async () => {
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    run_function_when_microservices_connected(dumb_obj.dumb_method)
    geodeStore.$patch({ status: Status.CONNECTED })
    viewerStore.$patch({ status: Status.CONNECTED })
    await flushPromises()
    expect(spy).toHaveBeenCalledWith()
  })
})
