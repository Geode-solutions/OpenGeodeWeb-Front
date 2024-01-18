import { describe, expect, test, beforeEach, vi } from "vitest"

describe("api_fetch.js", () => {
  const geode_store = use_geode_store()
  const viewer_store = use_viewer_store()

  beforeEach(async () => {
    await geode_store.$patch({ is_running: false })
    await viewer_store.$patch({ is_running: false })
  })
  function dumb() {
    console.log("TOTO")
    return 1
  }
  test("is_running true", async () => {
    const spy = vi.spyOn(dumb)

    await geode_store.$patch({ is_running: true })

    // dumb()
    expect(spy).toHaveBeenCalled()
    console.log(geode_store.is_running)
    runFunctionIfCloudRunning(dumb())
    expect(spy).toHaveBeenCalled()
  })
})
