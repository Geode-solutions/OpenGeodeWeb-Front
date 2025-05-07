import { describe, expect, test, beforeEach, vi } from "vitest"
import Status from "@ogw_f/utils/status.js"

describe("run_function_when_microservices_connected", () => {
  const geode_store = use_geode_store()
  const viewer_store = use_viewer_store()

  const dumb_obj = { dumb_method: () => true }

  beforeEach(async () => {
    await geode_store.$patch({ status: Status.NOT_CONNECTED })
    await viewer_store.$patch({ status: Status.NOT_CONNECTED })
  })
  console.log("Status.CONNECTED", Status.CONNECTED)
  test("microservices connected", async () => {
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    run_function_when_microservices_connected(dumb_obj.dumb_method)
    await geode_store.$patch({ status: Status.CONNECTED })
    await viewer_store.$patch({ status: Status.CONNECTED })
    expect(spy).toHaveBeenCalled()
  })

  test("microservices not connected", async () => {
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    run_function_when_microservices_connected(dumb_obj.dumb_method)
    await geode_store.$patch({ status: Status.NOT_CONNECTED })
    await viewer_store.$patch({ status: Status.NOT_CONNECTED })
    expect(spy).not.toHaveBeenCalled()
  })
})
