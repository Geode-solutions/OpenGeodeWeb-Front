import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { useAppStore } from "@/stores/app.js"
import { setActivePinia } from "pinia"

beforeEach(async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
})

describe("App Store", () => {
  describe("state", () => {
    test("initial state", () => {
      const app_store = useAppStore()
      expectTypeOf(app_store.stores).toBeArray()
      expectTypeOf(app_store.exportStore).toBeFunction()
      expectTypeOf(app_store.importStore).toBeFunction()
      expectTypeOf(app_store.registerStore).toBeFunction()
    })
  })

  describe("actions", () => {
    describe("registerStore", () => {
      test("register single store", () => {
        const app_store = useAppStore()
        const mock_store = {
          $id: "testStore",
          save: vi.fn().mockImplementation(() => ({ data: "test" })),
          load: vi.fn().mockImplementation(() => {}),
        }

        app_store.registerStore(mock_store)

        expect(app_store.stores.length).toBe(1)
        expect(app_store.stores[0]).toStrictEqual(mock_store)
      })

      test("register multiple stores", () => {
        const app_store = useAppStore()
        const mock_store_1 = {
          $id: "userStore",
          save: vi.fn().mockImplementation(() => {}),
          load: vi.fn().mockImplementation(() => {}),
        }
        const mock_store_2 = {
          $id: "geodeStore",
          save: vi.fn().mockImplementation(() => {}),
          load: vi.fn().mockImplementation(() => {}),
        }

        app_store.registerStore(mock_store_1)
        app_store.registerStore(mock_store_2)

        expect(app_store.stores.length).toBe(2)
        expect(app_store.stores[0].$id).toBe("userStore")
        expect(app_store.stores[1].$id).toBe("geodeStore")
      })
    })

    describe("Export", () => {
      test("export stores with exportStore method", () => {
        const app_store = useAppStore()
        const mock_store_1 = {
          $id: "userStore",
          exportStore: vi.fn().mockImplementation(() => ({
            name: "toto",
            email: "toto@titi.com",
          })),
          importStore: vi.fn().mockImplementation(() => {}),
        }
        const mock_store_2 = {
          $id: "geodeStore",
          exportStore: vi.fn().mockImplementation(() => ({ items: [], total: 0 })),
          importStore: vi.fn().mockImplementation(() => {}),
        }

        app_store.registerStore(mock_store_1)
        app_store.registerStore(mock_store_2)

        const snapshot = app_store.exportStore()

        expect(mock_store_1.exportStore).toHaveBeenCalledTimes(1)
        expect(mock_store_2.exportStore).toHaveBeenCalledTimes(1)
        expect(snapshot).toEqual({
          userStore: { name: "toto", email: "toto@titi.com" },
          geodeStore: { items: [], total: 0 },
        })
      })

      test("skip stores without exportSave method", () => {
        const app_store = useAppStore()
        const mock_store_1 = {
          $id: "withSave",
          exportStore: vi.fn().mockImplementation(() => ({ data: "test" })),
          importStore: vi.fn().mockImplementation(() => {}),
        }
        const mock_store_2 = {
          $id: "withoutSave",
          importStore: vi.fn().mockImplementation(() => {}),
        }

        app_store.registerStore(mock_store_1)
        app_store.registerStore(mock_store_2)

        const snapshot = app_store.exportStore()

        expect(mock_store_1.exportStore).toHaveBeenCalledTimes(1)
        expect(snapshot).toEqual({
          withSave: { data: "test" },
        })
        expect(snapshot.withoutSave).toBeUndefined()
      })

      test("return empty snapshot when no stores registered", () => {
        const app_store = useAppStore()
        const snapshot = app_store.exportStore()
        expect(snapshot).toEqual({})
      })
    })

    describe("load", () => {
      test("App Store > actions > importStore > import stores with importStore method", async () => {
        const appStore = useAppStore()
        const userStore = {
          $id: "userStore",
          importStore: vi.fn().mockResolvedValue(),
        }
        const geodeStore = {
          $id: "geodeStore",
          importStore: vi.fn().mockResolvedValue(),
        }
        appStore.registerStore(userStore)
        appStore.registerStore(geodeStore)
        const snapshot = {
          userStore: { some: "data" },
          geodeStore: { other: "data" },
        }
        await appStore.importStore(snapshot)
        expect(userStore.importStore).toHaveBeenCalledTimes(1)
        expect(geodeStore.importStore).toHaveBeenCalledTimes(1)
      })
    
      test("skip stores without importStore method", () => {
        const app_store = useAppStore()
        const mock_store_1 = {
          $id: "withImport",
          save: vi.fn().mockImplementation(() => {}),
          importStore: vi.fn().mockImplementation(() => {}),
        }
        const mock_store_2 = {
          $id: "withoutImport",
          save: vi.fn().mockImplementation(() => {}),
        }
        app_store.registerStore(mock_store_1)
        app_store.registerStore(mock_store_2)
        const snapshot = {
          withImport: { data: "test" },
          withoutImport: { data: "ignored" },
        }
        app_store.importStore(snapshot)
        expect(mock_store_1.importStore).toHaveBeenCalledTimes(1)
        expect(mock_store_2.importStore).toBeUndefined()
      })
    
      test("warn when store not found in snapshot", () => {
        const app_store = useAppStore()
        const console_warn_spy = vi.spyOn(console, "warn").mockImplementation(() => {})
        const mock_store = {
          $id: "testStore",
          importStore: vi.fn().mockImplementation(() => {}),
        }
        app_store.registerStore(mock_store)
        app_store.importStore({})
        expect(console_warn_spy).toHaveBeenCalledWith(
          expect.stringContaining("Stores not found in snapshot: testStore"),
        )
        console_warn_spy.mockRestore()
      })
    })
  })
})
