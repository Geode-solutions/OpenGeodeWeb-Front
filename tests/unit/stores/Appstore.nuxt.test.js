import { setActivePinia, defineStore } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { describe, test, expect, beforeEach, vi } from "vitest"
import { useAppStore } from "@/stores/app_store.js"

beforeEach(() => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
})

describe("AppStore", () => {
  describe("state", () => {
    test("initial state", () => {
      const app_store = useAppStore()
      expect(app_store.stores).toEqual({})
      expect(app_store.storeIds).toEqual([])
    })
  })

  describe("store registration", () => {
    test("register two stores", () => {
      const useTestStore1 = defineStore("testStore1", {
        state: () => ({ count: 0, name: "Store 1" }),
      })
      const useTestStore2 = defineStore("testStore2", {
        state: () => ({ items: ["a", "b"], isActive: true }),
      })

      useTestStore1()
      useTestStore2()

      const app_store = useAppStore()
      expect(app_store.storeIds).toContain("testStore1")
      expect(app_store.storeIds).toContain("testStore2")
      expect(app_store.storeIds).toHaveLength(2)
    })

    test("not register appStore itself", () => {
      const useTestStore = defineStore("testStore", {
        state: () => ({ value: 42 }),
      })
      useTestStore()

      const app_store = useAppStore()
      expect(app_store.storeIds).not.toContain("appStore")
    })
  })

  describe("actions", () => {
    describe("saveAll", () => {
      test("save two stores state", () => {
        const useTestStore1 = defineStore("testStore1", {
          state: () => ({ count: 5, name: "Test" }),
        })
        const useTestStore2 = defineStore("testStore2", {
          state: () => ({ items: ["x", "y"], isActive: false }),
        })

        useTestStore1()
        useTestStore2()

        const app_store = useAppStore()
        const snapshot = app_store.saveAll()

        expect(snapshot.testStore1).toEqual({ count: 5, name: "Test" })
        expect(snapshot.testStore2).toEqual({
          items: ["x", "y"],
          isActive: false,
        })
      })

      test("create deep copy", () => {
        const useTestStore = defineStore("testStore", {
          state: () => ({ nested: { value: "original" } }),
        })

        useTestStore()
        const app_store = useAppStore()
        const snapshot = app_store.saveAll()

        snapshot.testStore.nested.value = "modified"

        const store = app_store.stores.testStore
        expect(store.$state.nested.value).toBe("original")
      })
    })

    describe("loadAll", () => {
      test("restore state from snapshot", () => {
        const useTestStore1 = defineStore("testStore1", {
          state: () => ({ count: 0 }),
        })
        const useTestStore2 = defineStore("testStore2", {
          state: () => ({ items: [] }),
        })

        const store1 = useTestStore1()
        const store2 = useTestStore2()

        const snapshot = {
          testStore1: { count: 42 },
          testStore2: { items: ["a", "b", "c"] },
        }

        const app_store = useAppStore()
        app_store.loadAll(snapshot)

        expect(store1.count).toBe(42)
        expect(store2.items).toEqual(["a", "b", "c"])
      })

      test("handle partial snapshot", () => {
        const useTestStore1 = defineStore("testStore1", {
          state: () => ({ count: 10 }),
        })
        const useTestStore2 = defineStore("testStore2", {
          state: () => ({ value: 20 }),
        })

        const store1 = useTestStore1()
        const store2 = useTestStore2()

        const snapshot = { testStore1: { count: 100 } }

        const app_store = useAppStore()
        app_store.loadAll(snapshot)

        expect(store1.count).toBe(100)
        expect(store2.value).toBe(20)
      })

      test("warn on non-existent store", () => {
        const consoleSpy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => {})

        const useTestStore = defineStore("testStore", {
          state: () => ({ count: 0 }),
        })
        useTestStore()

        const snapshot = {
          testStore: { count: 42 },
          nonExistent: { value: 999 },
        }

        const app_store = useAppStore()
        app_store.loadAll(snapshot)

        expect(consoleSpy).toHaveBeenCalledWith(
          '[AppStore] Store "nonExistent" not found',
        )

        consoleSpy.mockRestore()
      })

      test("handle invalid snapshot", () => {
        const consoleSpy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => {})

        const app_store = useAppStore()
        app_store.loadAll(null)

        expect(consoleSpy).toHaveBeenCalledWith(
          "[AppStore] loadAll called with invalid snapshot",
        )

        consoleSpy.mockRestore()
      })
    })

    describe("saveAll + loadAll", () => {
      test("complete save and restore", () => {
        const useStyleStore = defineStore("dataStyle", {
          state: () => ({
            styles: {
              mesh1: { color: "#ff0000", opacity: 0.8 },
            },
          }),
        })

        const style_store = useStyleStore()
        const app_store = useAppStore()

        const snapshot1 = app_store.saveAll()

        style_store.styles.mesh1.color = "#0000ff"
        style_store.styles.mesh1.opacity = 0.5

        const snapshot2 = app_store.saveAll()
        expect(snapshot2.dataStyle.styles.mesh1.color).toBe("#0000ff")

        app_store.loadAll(snapshot1)
        expect(style_store.styles.mesh1.color).toBe("#ff0000")
        expect(style_store.styles.mesh1.opacity).toBe(0.8)
      })
    })
  })
})
