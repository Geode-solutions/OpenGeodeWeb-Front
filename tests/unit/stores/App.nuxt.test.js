import { describe, expect, expectTypeOf, test, vi } from "vitest"

import { useAppStore } from "@ogw_front/stores/app"

import { setupActivePinia } from "../../utils"

// Constants
const SINGLE_STORE_LENGTH = 1
const MULTIPLE_STORES_LENGTH = 2
const FIRST_INDEX = 0
const SECOND_INDEX = 1
const CALL_COUNT_ONCE = 1

describe("app store", () => {
  function setup() {
    setupActivePinia()
  }

  describe("state", () => {
    test("initial state", () => {
      setup()
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
        setup()
        const appStore = useAppStore()
        const mock_store = {
          $id: "testStore",
          save: vi.fn().mockImplementation(() => ({ data: "test" })),
          load: vi.fn().mockImplementation(),
        }

        appStore.registerStore(mock_store)

        expect(appStore.stores).toHaveLength(SINGLE_STORE_LENGTH)
        expect(appStore.stores[FIRST_INDEX]).toStrictEqual(mock_store)
      })

      test("register multiple stores", () => {
        setup()
        const appStore = useAppStore()
        const mock_store_1 = {
          $id: "userStore",
          save: vi.fn().mockImplementation(),
          load: vi.fn().mockImplementation(),
        }
        const mock_store_2 = {
          $id: "geodeStore",
          save: vi.fn().mockImplementation(),
          load: vi.fn().mockImplementation(),
        }

        appStore.registerStore(mock_store_1)
        appStore.registerStore(mock_store_2)

        expect(appStore.stores).toHaveLength(MULTIPLE_STORES_LENGTH)
        expect(appStore.stores[FIRST_INDEX].$id).toBe("userStore")
        expect(appStore.stores[SECOND_INDEX].$id).toBe("geodeStore")
      })
    })

    describe("export", () => {
      test("export stores with exportStores method", async () => {
        setup()
        const appStore = useAppStore()
        const mock_store_1 = {
          $id: "userStore",
          exportStores: vi.fn().mockImplementation(() => ({
            name: "toto",
            email: "toto@titi.com",
          })),
          importStores: vi.fn().mockImplementation(),
        }
        const mock_store_2 = {
          $id: "geodeStore",
          exportStores: vi
            .fn()
            .mockImplementation(() => ({ items: [], total: 0 })),
          importStores: vi.fn().mockImplementation(),
        }

        appStore.registerStore(mock_store_1)
        appStore.registerStore(mock_store_2)

        const snapshot = await appStore.exportStores()

        expect(mock_store_1.exportStores).toHaveBeenCalledTimes(CALL_COUNT_ONCE)
        expect(mock_store_2.exportStores).toHaveBeenCalledTimes(CALL_COUNT_ONCE)
        expect(snapshot).toStrictEqual({
          userStore: { name: "toto", email: "toto@titi.com" },
          geodeStore: { items: [], total: 0 },
        })
      })

      test("skip stores without exportSave method", async () => {
        setup()
        const appStore = useAppStore()
        const mock_store_1 = {
          $id: "withSave",
          exportStores: vi.fn().mockImplementation(() => ({ data: "test" })),
          importStores: vi.fn().mockImplementation(),
        }
        const mock_store_2 = {
          $id: "withoutSave",
          importStores: vi.fn().mockImplementation(),
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
        setup()
        const appStore = useAppStore()
        const snapshot = await appStore.exportStores()
        expect(snapshot).toStrictEqual({})
      })
    })

    describe("load", () => {
      test("import stores with importStores method", async () => {
        setup()
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
        expect(userStore.importStores).toHaveBeenCalledTimes(CALL_COUNT_ONCE)
        expect(geodeStore.importStores).toHaveBeenCalledTimes(CALL_COUNT_ONCE)
      })

      test("skip stores without importStores method", async () => {
        setup()
        const appStore = useAppStore()
        const mock_store_1 = {
          $id: "withImport",
          save: vi.fn().mockImplementation(),
          importStores: vi.fn().mockImplementation(),
        }
        const mock_store_2 = {
          $id: "withoutImport",
          save: vi.fn().mockImplementation(),
        }
        appStore.registerStore(mock_store_1)
        appStore.registerStore(mock_store_2)
        const snapshot = {
          withImport: { data: "test" },
          withoutImport: { data: "ignored" },
        }
        await appStore.importStores(snapshot)
        expect(mock_store_1.importStores).toHaveBeenCalledTimes(CALL_COUNT_ONCE)
        expect(mock_store_2.importStores).toBeUndefined()
      })

      test("warn when store not found in snapshot", async () => {
        setup()
        const appStore = useAppStore()
        const console_warn_spy = vi.spyOn(console, "warn").mockImplementation()
        const mock_store = {
          $id: "testStore",
          importStores: vi.fn().mockImplementation(),
        }
        appStore.registerStore(mock_store)
        await appStore.importStores({})
        expect(console_warn_spy).toHaveBeenCalledWith(
          expect.stringContaining("Stores not found in snapshot: testStore"),
        )
        console_warn_spy.mockRestore()
      })
    })
  })
})
