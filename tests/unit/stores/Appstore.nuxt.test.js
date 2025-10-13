import { setActivePinia, defineStore } from "pinia"
import { createTestingPinia } from "@pinia/testing"
import { describe, test, expect, beforeEach, vi } from "vitest"
import { ref, reactive } from "vue"
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
    test("register two stores in options mode", () => {
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

    test("register two stores in setup mode", () => {
      const useTestStore1 = defineStore("setupStore1", () => {
        const count = ref(0)
        const name = ref("Setup Store 1")
        return { count, name }
      })
      const useTestStore2 = defineStore("setupStore2", () => {
        const items = ref(["a", "b"])
        const isActive = ref(true)
        return { items, isActive }
      })

      useTestStore1()
      useTestStore2()

      const app_store = useAppStore()
      expect(app_store.storeIds).toContain("setupStore1")
      expect(app_store.storeIds).toContain("setupStore2")
      expect(app_store.storeIds).toHaveLength(2)
    })

    test("register mixed stores", () => {
      const useOptionsStore = defineStore("optionsStore", {
        state: () => ({ value: 42 }),
      })
      const useSetupStore = defineStore("setupStore", () => {
        const value = ref(100)
        return { value }
      })

      useOptionsStore()
      useSetupStore()

      const app_store = useAppStore()
      expect(app_store.storeIds).toContain("optionsStore")
      expect(app_store.storeIds).toContain("setupStore")
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
      test("save two stores state in options mode", () => {
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

      test("save two stores state in setup mode", () => {
        const useTestStore1 = defineStore("setupStore1", () => {
          const count = ref(10)
          const name = ref("Setup Test")
          return { count, name }
        })
        const useTestStore2 = defineStore("setupStore2", () => {
          const items = ref(["foo", "bar"])
          const isActive = ref(true)
          return { items, isActive }
        })

        useTestStore1()
        useTestStore2()

        const app_store = useAppStore()
        const snapshot = app_store.saveAll()

        expect(snapshot.setupStore1).toEqual({ count: 10, name: "Setup Test" })
        expect(snapshot.setupStore2).toEqual({
          items: ["foo", "bar"],
          isActive: true,
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
      test("restore state from snapshot in options mode", () => {
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

      test("restore state from snapshot in setup mode", () => {
        const useTestStore1 = defineStore("setupStore1", () => {
          const count = ref(0)
          return { count }
        })
        const useTestStore2 = defineStore("setupStore2", () => {
          const items = ref([])
          return { items }
        })

        const store1 = useTestStore1()
        const store2 = useTestStore2()

        const snapshot = {
          setupStore1: { count: 99 },
          setupStore2: { items: ["x", "y", "z"] },
        }

        const app_store = useAppStore()
        app_store.loadAll(snapshot)

        expect(store1.count).toBe(99)
        expect(store2.items).toEqual(["x", "y", "z"])
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
      test("complete save and restore in options mode", () => {
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

      test("complete save and restore in setup mode", () => {
        const useConfigStore = defineStore("configStore", () => {
          const settings = reactive({
            theme: "dark",
            layout: { width: 1200, height: 800 },
          })
          return { settings }
        })

        const config_store = useConfigStore()
        const app_store = useAppStore()

        const snapshot1 = app_store.saveAll()

        config_store.settings.theme = "light"
        config_store.settings.layout.width = 1920

        const snapshot2 = app_store.saveAll()
        expect(snapshot2.configStore.settings.theme).toBe("light")
        expect(snapshot2.configStore.settings.layout.width).toBe(1920)

        app_store.loadAll(snapshot1)
        expect(config_store.settings.theme).toBe("dark")
        expect(config_store.settings.layout.width).toBe(1200)
      })

      test("save and restore mixed stores", () => {
        const useOptionsStore = defineStore("optionsStore", {
          state: () => ({ counter: 0 }),
        })
        const useSetupStore = defineStore("setupStore", () => {
          const value = ref(100)
          return { value }
        })

        const options_store = useOptionsStore()
        const setup_store = useSetupStore()
        const app_store = useAppStore()

        options_store.counter = 50
        setup_store.value = 200

        const snapshot = app_store.saveAll()

        options_store.counter = 0
        setup_store.value = 0

        app_store.loadAll(snapshot)

        expect(options_store.counter).toBe(50)
        expect(setup_store.value).toBe(200)
      })
    })
  })
})
