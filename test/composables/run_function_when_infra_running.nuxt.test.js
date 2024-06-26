import { describe, expect, test, beforeEach, vi } from "vitest"

describe("run_function_when_infra_running", () => {
  const geode_store = use_geode_store()
  const viewer_store = use_viewer_store()

  const dumb_obj = { dumb_method: () => true }

  beforeEach(async () => {
    await geode_store.$patch({ is_running: false })
    await viewer_store.$patch({ is_running: false })
  })

  test("is_running true", async () => {
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    await geode_store.$patch({ is_running: true })
    await viewer_store.$patch({ is_running: true })

    await run_function_when_infra_running(dumb_obj.dumb_method)
    expect(spy).toHaveBeenCalled()
  })

  test("is_running false", async () => {
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    run_function_when_infra_running(dumb_obj.dumb_method)
    await geode_store.$patch({ is_running: true })
    await viewer_store.$patch({ is_running: true })
    expect(spy).toHaveBeenCalled()
  })
})
