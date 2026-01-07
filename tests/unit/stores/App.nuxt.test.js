import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

import { useAppStore } from "@ogw_front/stores/app"

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
      const appStore = useAppStore()
      expectTypeOf(appStore.stores).toBeArray()
      expectTypeOf(appStore.exportStores).toBeFunction()
      expectTypeOf(appStore.importStores).toBeFunction()
      expectTypeOf(appStore.registerStore).toBeFunction()
    })
  })

  describe("actions", () => {
    describe("registerStore", () => {
      test("register single store", () => {
        const appStore = useAppStore()
        const mock_store = {
          $id: "testStore",
          save: vi.fn().mockImplementation(() => ({ data: "test" })),
          load: vi.fn().mockImplementation(() => { }),
        }

        appStore.registerStore(mock_store)

        expect(appStore.stores.length).toBe(1)
        expect(appStore.stores[0]).toStrictEqual(mock_store)
      })

      test("register multiple stores", () => {
        const appStore = useAppStore()
        const mock_store_1 = {
          $id: "userStore",
          save: vi.fn().mockImplementation(() => { }),
          load: vi.fn().mockImplementation(() => { }),
        }
        const mock_store_2 = {
          $id: "geodeStore",
          save: vi.fn().mockImplementation(() => { }),
          load: vi.fn().mockImplementation(() => { }),
        }

        appStore.registerStore(mock_store_1)
        appStore.registerStore(mock_store_2)

        expect(appStore.stores.length).toBe(2)
        expect(appStore.stores[0].$id).toBe("userStore")
        expect(appStore.stores[1].$id).toBe("geodeStore")
      })
    })

    describe("Export", () => {
      test("export stores with exportStores method", async () => {
        const appStore = useAppStore()
        const mock_store_1 = {
          $id: "userStore",
          exportStores: vi.fn().mockImplementation(() => ({
            name: "toto",
            email: "toto@titi.com",
          })),
          importStores: vi.fn().mockImplementation(() => { }),
        }
        const mock_store_2 = {
          $id: "geodeStore",
          exportStores: vi
            .fn()
            .mockImplementation(() => ({ items: [], total: 0 })),
          importStores: vi.fn().mockImplementation(() => { }),
        }

        appStore.registerStore(mock_store_1)
        appStore.registerStore(mock_store_2)

        const snapshot = await appStore.exportStores()

        expect(mock_store_1.exportStores).toHaveBeenCalledTimes(1)
        expect(mock_store_2.exportStores).toHaveBeenCalledTimes(1)
        expect(snapshot).toEqual({
          userStore: { name: "toto", email: "toto@titi.com" },
          geodeStore: { items: [], total: 0 },
        })
      })

      test("skip stores without exportSave method", async () => {
        const appStore = useAppStore()
        const mock_store_1 = {
          $id: "withSave",
          exportStores: vi.fn().mockImplementation(() => ({ data: "test" })),
          importStores: vi.fn().mockImplementation(() => { }),
        }
        const mock_store_2 = {
          $id: "withoutSave",
          importStores: vi.fn().mockImplementation(() => { }),
        }

        appStore.registerStore(mock_store_1)
        appStore.registerStore(mock_store_2)

        const snapshot = await appStore.exportStores()

        expect(mock_store_1.exportStores).toHaveBeenCalledTimes(1)
        expect(snapshot).toEqual({
          withSave: { data: "test" },
        })
        expect(snapshot.withoutSave).toBeUndefined()
      })

      test("return empty snapshot when no stores registered", async () => {
        const appStore = useAppStore()
        const snapshot = await appStore.exportStores()
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
        const appStore = useAppStore()
        const mock_store_1 = {
          $id: "withImport",
          save: vi.fn().mockImplementation(() => { }),
          importStores: vi.fn().mockImplementation(() => { }),
        }
        const mock_store_2 = {
          $id: "withoutImport",
          save: vi.fn().mockImplementation(() => { }),
        }
        appStore.registerStore(mock_store_1)
        appStore.registerStore(mock_store_2)
        const snapshot = {
          withImport: { data: "test" },
          withoutImport: { data: "ignored" },
        }
        appStore.importStores(snapshot)
        expect(mock_store_1.importStores).toHaveBeenCalledTimes(1)
        expect(mock_store_2.importStores).toBeUndefined()
      })

      test("warn when store not found in snapshot", () => {
        const appStore = useAppStore()
        const console_warn_spy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => { })
        const mock_store = {
          $id: "testStore",
          importStores: vi.fn().mockImplementation(() => { }),
        }
        appStore.registerStore(mock_store)
        appStore.importStores({})
        expect(console_warn_spy).toHaveBeenCalledWith(
          expect.stringContaining("Stores not found in snapshot: testStore"),
        )
        console_warn_spy.mockRestore()
      })
    })
  })
})
