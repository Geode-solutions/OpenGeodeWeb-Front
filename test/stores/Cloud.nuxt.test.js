import { describe, test, expect, beforeEach } from "vitest"
import { registerEndpoint } from "@nuxt/test-utils/runtime"

const cloud_store = use_cloud_store()
const errors_store = use_errors_store()
const geode_store = use_geode_store()
const websocket_store = use_websocket_store()

describe("Cloud Store", () => {
  beforeEach(async () => {
    await geode_store.$patch({ is_running: false })
    await websocket_store.$patch({ is_running: false })
  })

  describe("getters", () => {
    test("is_running", async () => {
      expect(cloud_store.is_running).toBe(false)
      await geode_store.$patch({ is_running: true })
      await websocket_store.$patch({ is_running: true })
      expect(cloud_store.is_running).toBe(true)
    })
    test("is_busy", async () => {
      expect(cloud_store.is_busy).toBe(false)
      await geode_store.start_request()
      await websocket_store.start_request()
      expect(cloud_store.is_busy).toBe(true)
    })
  })

  describe("actions", () => {
    describe("create_backend", async () => {
      test("test without end-point", async () => {
        //   expect(geode_store.is_running).toBe(false)
        //   await cloud_store.create_connexion()
        //   expect(geode_store.is_running).toBe(false)
        //   expect(errors_store.server_error).toBe(true)
      })
      //   test("test with end-point", async () => {
      //     expect(geode_store.is_running).toBe(false)
      //     registerEndpoint("/undefined/createbackend", {
      //       method: "POST",
      //       handler: () => {
      //         return { ID: "123456" }
      //       },
      //     })
      //     await cloud_store.create_connexion()
      //     expect(geode_store.is_running).toBe(true)
      //     expect(cloud_store.ID).toBe("123456")
      //   })
    })
  })
})
