import { describe, test, expect, beforeEach } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"
import { flushPromises } from "@vue/test-utils"

const infra_store = use_infra_store()
const geode_store = use_geode_store()
const viewer_store = use_viewer_store()

describe("Cloud Store", () => {
  beforeEach(async () => {
    await geode_store.$patch({ is_running: false })
    await viewer_store.$patch({ is_running: false })
  })

  describe("getters", () => {
    test("is_running", async () => {
      expect(infra_store.is_running).toBe(false)
      await geode_store.$patch({ is_running: true })
      await viewer_store.$patch({ is_running: true })
      expect(infra_store.is_running).toBe(true)
    })
    test("is_busy", async () => {
      expect(infra_store.is_busy).toBe(false)
      await geode_store.start_request()
      await viewer_store.start_request()
      expect(infra_store.is_busy).toBe(true)
    })
  })

  describe("actions", () => {
    describe("create_backend", async () => {
      test("test without end-point", async () => {
        expect(geode_store.is_running).toBe(false)
        await infra_store.create_backend()
        expect(geode_store.is_running).toBe(false)
      })
      test("test with end-point", async () => {
        expect(geode_store.is_running).toBe(false)
        registerEndpoint("/createbackend", {
          method: "POST",
          handler: () => ({ ID: "123456" }),
        })
        await infra_store.create_backend()
        await flushPromises()
      })
    })
  })
})
