import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
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
      expectTypeOf(app_store.exportStores).toBeFunction()
      expectTypeOf(app_store.importStores).toBeFunction()
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
      test("export stores with exportStores method", () => {
        const app_store = useAppStore()
        const mock_store_1 = {
          $id: "userStore",
          exportStores: vi.fn().mockImplementation(() => ({
            name: "toto",
            email: "toto@titi.com",
          })),
          importStores: vi.fn().mockImplementation(() => {}),
        }
        const mock_store_2 = {
          $id: "geodeStore",
          exportStores: vi
            .fn()
            .mockImplementation(() => ({ items: [], total: 0 })),
          importStores: vi.fn().mockImplementation(() => {}),
        }

        app_store.registerStore(mock_store_1)
        app_store.registerStore(mock_store_2)

        const snapshot = app_store.exportStores()

        expect(mock_store_1.exportStores).toHaveBeenCalledTimes(1)
        expect(mock_store_2.exportStores).toHaveBeenCalledTimes(1)
        expect(snapshot).toEqual({
          userStore: { name: "toto", email: "toto@titi.com" },
          geodeStore: { items: [], total: 0 },
        })
      })

      test("skip stores without exportSave method", () => {
        const app_store = useAppStore()
        const mock_store_1 = {
          $id: "withSave",
          exportStores: vi.fn().mockImplementation(() => ({ data: "test" })),
          importStores: vi.fn().mockImplementation(() => {}),
        }
        const mock_store_2 = {
          $id: "withoutSave",
          importStores: vi.fn().mockImplementation(() => {}),
        }

        app_store.registerStore(mock_store_1)
        app_store.registerStore(mock_store_2)

        const snapshot = app_store.exportStores()

        expect(mock_store_1.exportStores).toHaveBeenCalledTimes(1)
        expect(snapshot).toEqual({
          withSave: { data: "test" },
        })
        expect(snapshot.withoutSave).toBeUndefined()
      })

      test("return empty snapshot when no stores registered", () => {
        const app_store = useAppStore()
        const snapshot = app_store.exportStores()
        expect(snapshot).toEqual({})
      })
    })

    describe("load", () => {
      test("App Store > actions > importStores > import stores with importStores method", async () => {
        const appStore = useAppStore()
        const userStore = {
          $id: "userStore",
          importStores: vi.fn().mockResolvedValue(),
        }
        const geodeStore = {
          $id: "geodeStore",
          importStores: vi.fn().mockResolvedValue(),
        }
        appStore.registerStore(userStore)
        appStore.registerStore(geodeStore)
        const snapshot = {
          userStore: { some: "data" },
          geodeStore: { other: "data" },
        }
        await appStore.importStores(snapshot)
        expect(userStore.importStores).toHaveBeenCalledTimes(1)
        expect(geodeStore.importStores).toHaveBeenCalledTimes(1)
      })

      test("skip stores without importStores method", () => {
        const app_store = useAppStore()
        const mock_store_1 = {
          $id: "withImport",
          save: vi.fn().mockImplementation(() => {}),
          importStores: vi.fn().mockImplementation(() => {}),
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
        app_store.importStores(snapshot)
        expect(mock_store_1.importStores).toHaveBeenCalledTimes(1)
        expect(mock_store_2.importStores).toBeUndefined()
      })

      test("warn when store not found in snapshot", () => {
        const app_store = useAppStore()
        const console_warn_spy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => {})
        const mock_store = {
          $id: "testStore",
          importStores: vi.fn().mockImplementation(() => {}),
        }
        app_store.registerStore(mock_store)
        app_store.importStores({})
        expect(console_warn_spy).toHaveBeenCalledWith(
          expect.stringContaining("Stores not found in snapshot: testStore"),
        )
        console_warn_spy.mockRestore()
      })
    })
  })
})
