import { setActivePinia, createPinia } from "pinia"
import { describe, expect, test, beforeEach, vi } from "vitest"

describe("api_fetch.js", () => {
  const geode_store = use_geode_store()
  const websocket_store = use_websocket_store()
  const cloud_store = use_cloud_store()

  const dumb_obj = { dumb_method: () => true }

  beforeEach(async () => {
    setActivePinia(createPinia())
    await geode_store.$patch({ is_running: false })
    await websocket_store.$patch({ is_running: false })
  })

  test("is_running true", async () => {
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    console.log("cloud_store.is_running", cloud_store.is_running)
    await geode_store.$patch({ is_running: true })
    await websocket_store.$patch({ is_running: true })

    await runFunctionIfCloudRunning(dumb_obj.dumb_method)
    expect(spy).toHaveBeenCalled()
  })

  //   test("is_running false", async () => {
  //     const spy = vi.spyOn(dumb_obj, "dumb_method")
  //     runFunctionIfCloudRunning(dumb_obj.dumb_method)
  //     // expect(spy).not.toHaveBeenCalled()
  //     await geode_store.$patch({ is_running: true })
  //     await websocket_store.$patch({ is_running: true })
  //     console.log("geode_store.is_running", geode_store.is_running)
  //     console.log("websocket_store.is_running", websocket_store.is_running)
  //     console.log("cloud_store.is_running", cloud_store.is_running)

  //     expect(spy).toHaveBeenCalled()
  //   })
})
