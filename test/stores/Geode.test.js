import { setActivePinia, createPinia } from "pinia"
import { use_geode_store } from "@/stores/geode"
import { use_infra_store } from "@/stores/infra"
import { describe, test, expect, beforeEach } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

describe("Geode Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  globalThis.useRuntimeConfig = () => {
    return {
      public: {
        API_URL: "localhost",
        NODE_ENV: "production",
      },
    }
  }

  test("base_url", () => {
    const geode_store = use_geode_store()
    const infra_store = use_infra_store()
    infra_store.$patch({ ID: "123456" })
    geode_store.start_request()
    expect(geode_store.request_counter).toBe(1)
  })

  test("do_ping", async () => {
    const geode_store = use_geode_store()
    const errors_store = use_errors_store()
    await geode_store.do_ping()

    expect(geode_store.is_running).toBe(false)
    expect(errors_store.server_error).toBe(true)

    registerEndpoint("/ping", {
      method: "POST",
      handler: () => ({}),
    })
    await geode_store.do_ping()
    expect(geode_store.is_running).toBe(true)
  })

  test("start_request", () => {
    const geode_store = use_geode_store()
    geode_store.start_request()
    expect(geode_store.request_counter).toBe(1)
    expect(geode_store.is_busy).toBe(true)
  })

  test("stop_request", () => {
    const geode_store = use_geode_store()
    geode_store.stop_request()
    expect(geode_store.request_counter).toBe(-1)
    expect(geode_store.is_busy).toBe(false)
  })
})
