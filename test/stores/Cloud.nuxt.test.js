import { describe, test, expect } from "vitest"
import registerEndpoint from "@nuxt/test-utils/runtime"

const cloud_store = use_cloud_store()
const geode_store = use_geode_store()
const websocket_store = use_websocket_store()

describe("Cloud Store", () => {
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
    test("create_backend", async () => {
      expect(geode_store.is_running).toBe(false)
      registerEndpoint("/createbackend", {
        method: "POST",
        handler: () => {
          console.log("createbackend")
          return {}
        },
      })
      await cloud_store.create_connexion()
      expect(geode_store.is_running).toBe(true)
    })
    // test("create_connexion", async () => {
    //   expect(geode_store.is_running).toBe(false)
    //   registerEndpoint("/ping", {
    //     method: "POST",
    //     handler: () => {
    //       console.log("ping")
    //       return {}
    //     },
    //   })
    //   await cloud_store.create_connexion()
    //   expect(geode_store.is_running).toBe(true)
    // })
  })
})
