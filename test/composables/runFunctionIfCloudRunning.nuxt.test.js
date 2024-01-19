import { describe, expect, test, beforeEach, vi } from "vitest"

describe("api_fetch.js", () => {
  const geode_store = use_geode_store()
  const websocket_store = use_websocket_store()

  const dumb_obj = { dumb_method: () => true }

  beforeEach(async () => {
    await geode_store.$patch({ is_running: false })
    await websocket_store.$patch({ is_running: false })
  })

  test("is_running true", async () => {
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    await geode_store.$patch({ is_running: true })
    await websocket_store.$patch({ is_running: true })

    await runFunctionIfCloudRunning(dumb_obj.dumb_method)
    expect(spy).toHaveBeenCalled()
  })

  test("is_running false", async () => {
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    runFunctionIfCloudRunning(dumb_obj.dumb_method)
    await geode_store.$patch({ is_running: true })
    await websocket_store.$patch({ is_running: true })
    expect(spy).toHaveBeenCalled()
  })
})
