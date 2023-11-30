import { setActivePinia, createPinia } from "pinia"
import { use_geode_store } from "../../stores/geode"
import { use_cloud_store } from "../../stores/cloud"

describe("Geode Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  globalThis.useRuntimeConfig = () => {
    return {
      public: {
        GEODE_PROTOCOL: "http",
        API_URL: "localhost",
        GEODE_PORT: "5000",
        NODE_ENV: "production",
      },
    }
  }

  it("base_url", function base_url() {
    const geode_store = use_geode_store()
    const cloud_store = use_cloud_store()
    cloud_store.$patch({ ID: "123456" })
    // expect(geode_store.base_url).toBe("http://localhost:5000/123456/geode")
    geode_store.start_request()
    expect(geode_store.request_counter).toBe(1)
  })

  it("start_request", () => {
    const geode_store = use_geode_store()
    geode_store.start_request()
    expect(geode_store.request_counter).toBe(1)
    expect(geode_store.is_busy).toBe(true)
  })

  it("stop_request", () => {
    const geode_store = use_geode_store()
    geode_store.stop_request()
    expect(geode_store.request_counter).toBe(-1)
  })
})
