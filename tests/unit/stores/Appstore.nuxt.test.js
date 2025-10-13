import { setActivePinia, defineStore, createPinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { beforeEach, describe, expect, test, vi, afterEach } from "vitest"
import { useAppStore } from "@/stores/app_store"

const useTestStore1 = defineStore("testStore1", {
  state: () => ({
    counter: 0,
    name: "Store 1",
    items: [],
  }),
})

const useTestStore2 = defineStore("testStore2", {
  state: () => ({
    isActive: false,
    description: "Test description",
    settings: {
      theme: "dark",
      language: "fr",
    },
  }),
})

describe("AppStore", () => {
  let pinia

  beforeEach(() => {
    pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    setActivePinia(pinia)

    vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Store discovery", () => {
    test("should retrieve all registered stores", () => {
      useTestStore1()
      useTestStore2()
      const appStore = useAppStore()

      expect(appStore.storeIds).toContain("testStore1")
      expect(appStore.storeIds).toContain("testStore2")
      expect(appStore.stores.testStore1).toBeDefined()
      expect(appStore.stores.testStore2).toBeDefined()
    })

    test("should NOT include appStore itself", () => {
      useTestStore1()
      const appStore = useAppStore()

      expect(appStore.storeIds).not.toContain("appStore")
    })

    test("should count stores correctly", () => {
      useTestStore1()
      useTestStore2()
      const appStore = useAppStore()

      expect(appStore.count).toBe(2)
    })

    test("should return empty when no stores initialized", () => {
      const appStore = useAppStore()

      expect(appStore.stores).toEqual({})
      expect(appStore.storeIds).toEqual([])
      expect(appStore.count).toBe(0)
    })

    test("should handle stores created after appStore", () => {
      const appStore = useAppStore()

      expect(appStore.count).toBe(0)

      useTestStore1()

      expect(appStore.count).toBe(1)
      expect(appStore.storeIds).toContain("testStore1")
    })
  })

  describe("saveAll", () => {
    test("should save state of all stores", () => {
      const store1 = useTestStore1()
      const store2 = useTestStore2()

      store1.$patch({ counter: 42, name: "Modified", items: ["item1"] })
      store2.$patch({ isActive: true, settings: { theme: "light" } })

      const appStore = useAppStore()
      const snapshot = appStore.saveAll()

      expect(snapshot.testStore1.counter).toBe(42)
      expect(snapshot.testStore1.name).toBe("Modified")
      expect(snapshot.testStore2.isActive).toBe(true)
      expect(snapshot.testStore2.settings.theme).toBe("light")
    })

    test("should NOT include appStore in snapshot", () => {
      useTestStore1()
      const appStore = useAppStore()
      const snapshot = appStore.saveAll()

      expect(snapshot.appStore).toBeUndefined()
    })

    test("should create deep copy (not reference)", () => {
      const store1 = useTestStore1()
      store1.$patch({ items: ["original"] })

      const appStore = useAppStore()
      const snapshot = appStore.saveAll()

      snapshot.testStore1.items.push("modified")

      expect(store1.items).toEqual(["original"])
      expect(snapshot.testStore1.items).toEqual(["original", "modified"])
    })

    test("should handle nested objects", () => {
      const store2 = useTestStore2()
      store2.$patch({
        settings: {
          theme: "custom",
          nested: { deep: { value: 123 } },
        },
      })

      const appStore = useAppStore()
      const snapshot = appStore.saveAll()

      expect(snapshot.testStore2.settings.nested.deep.value).toBe(123)
    })

    test("should return empty object when no stores", () => {
      const appStore = useAppStore()
      const snapshot = appStore.saveAll()

      expect(snapshot).toEqual({})
    })
  })

  describe("loadAll", () => {
    test("should load state into stores", () => {
      const store1 = useTestStore1()
      const store2 = useTestStore2()
      const appStore = useAppStore()

      const snapshot = {
        testStore1: { counter: 99, name: "Loaded", items: ["a", "b"] },
        testStore2: { isActive: true, settings: { theme: "blue" } },
      }

      const result = appStore.loadAll(snapshot)

      expect(result.success).toContain("testStore1")
      expect(result.success).toContain("testStore2")
      expect(result.errors).toHaveLength(0)
      expect(store1.counter).toBe(99)
      expect(store1.name).toBe("Loaded")
      expect(store2.isActive).toBe(true)
      expect(store2.settings.theme).toBe("blue")
    })

    test("should skip non-existent stores", () => {
      const store1 = useTestStore1()
      const appStore = useAppStore()

      const snapshot = {
        testStore1: { counter: 50 },
        nonExistent: { data: "ignored" },
      }

      const result = appStore.loadAll(snapshot)

      expect(result.success).toContain("testStore1")
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].id).toBe("nonExistent")
      expect(store1.counter).toBe(50)
    })

    test("should handle invalid snapshot", () => {
      const appStore = useAppStore()

      const result = appStore.loadAll(null)

      expect(result.success).toHaveLength(0)
      expect(console.warn).toHaveBeenCalled()
    })

    test("should handle empty snapshot", () => {
      const store1 = useTestStore1()
      store1.$patch({ counter: 10 })
      const appStore = useAppStore()

      const result = appStore.loadAll({})

      expect(result.success).toHaveLength(0)
      expect(store1.counter).toBe(10)
    })

    test("should handle partial updates", () => {
      const store1 = useTestStore1()
      store1.$patch({ counter: 100, name: "Original", items: ["x"] })
      const appStore = useAppStore()

      const snapshot = {
        testStore1: { counter: 200 },
      }

      appStore.loadAll(snapshot)

      expect(store1.counter).toBe(200)
      expect(store1.name).toBe("Original")
      expect(store1.items).toEqual(["x"])
    })
  })

  describe("Integration", () => {
    test("should save and restore state", () => {
      const store1 = useTestStore1()
      const store2 = useTestStore2()
      const appStore = useAppStore()

      store1.$patch({ counter: 123, name: "Original", items: ["a"] })
      store2.$patch({ isActive: true, settings: { theme: "dark" } })

      const snapshot = appStore.saveAll()

      store1.$patch({ counter: 999, name: "Modified" })
      store2.$patch({ isActive: false })

      expect(store1.counter).toBe(999)

      appStore.loadAll(snapshot)

      expect(store1.counter).toBe(123)
      expect(store1.name).toBe("Original")
      expect(store2.isActive).toBe(true)
    })

    test("should handle multiple save/load cycles", () => {
      const store1 = useTestStore1()
      const appStore = useAppStore()

      store1.$patch({ counter: 1 })
      const snapshot1 = appStore.saveAll()

      store1.$patch({ counter: 2 })
      const snapshot2 = appStore.saveAll()

      store1.$patch({ counter: 3 })

      appStore.loadAll(snapshot1)
      expect(store1.counter).toBe(1)

      appStore.loadAll(snapshot2)
      expect(store1.counter).toBe(2)
    })
  })
})
