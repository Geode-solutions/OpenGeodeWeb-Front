import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { useAppStore } from "@/stores/app_store.js"
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
      expectTypeOf(app_store.save).toBeFunction()
      expectTypeOf(app_store.load).toBeFunction()
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

    describe("save", () => {
      test("save stores with save method", () => {
        const app_store = useAppStore()
        const mock_store_1 = {
          $id: "userStore",
          save: vi.fn().mockImplementation(() => ({
            name: "toto",
            email: "toto@titi.com",
          })),
          load: vi.fn().mockImplementation(() => {}),
        }
        const mock_store_2 = {
          $id: "geodeStore",
          save: vi.fn().mockImplementation(() => ({ items: [], total: 0 })),
          load: vi.fn().mockImplementation(() => {}),
        }

        app_store.registerStore(mock_store_1)
        app_store.registerStore(mock_store_2)

        const snapshot = app_store.save()

        expect(mock_store_1.save).toHaveBeenCalledTimes(1)
        expect(mock_store_2.save).toHaveBeenCalledTimes(1)
        expect(snapshot).toEqual({
          userStore: { name: "toto", email: "toto@titi.com" },
          geodeStore: { items: [], total: 0 },
        })
      })

      test("skip stores without save method", () => {
        const app_store = useAppStore()
        const mock_store_1 = {
          $id: "withSave",
          save: vi.fn().mockImplementation(() => ({ data: "test" })),
          load: vi.fn().mockImplementation(() => {}),
        }
        const mock_store_2 = {
          $id: "withoutSave",
          load: vi.fn().mockImplementation(() => {}),
        }

        app_store.registerStore(mock_store_1)
        app_store.registerStore(mock_store_2)

        const snapshot = app_store.save()

        expect(mock_store_1.save).toHaveBeenCalledTimes(1)
        expect(snapshot).toEqual({
          withSave: { data: "test" },
        })
        expect(snapshot.withoutSave).toBeUndefined()
      })

      test("return empty snapshot when no stores registered", () => {
        const app_store = useAppStore()
        const snapshot = app_store.save()
        expect(snapshot).toEqual({})
      })
    })

    describe("load", () => {
      test("App Store > actions > load > load stores with load method", async () => {
        const appStore = useAppStore()
      
        const userStore = { $id: "userStore", load: vi.fn().mockResolvedValue() }
        const geodeStore = { $id: "geodeStore", load: vi.fn().mockResolvedValue() }
      
        appStore.registerStore(userStore)
        appStore.registerStore(geodeStore)
      
        const snapshot = {
          userStore: { some: "data" },
          geodeStore: { other: "data" },
        }
      
        await appStore.load(snapshot)
        expect(userStore.load).toHaveBeenCalledTimes(1)
        expect(geodeStore.load).toHaveBeenCalledTimes(1)
      })

      test("skip stores without load method", () => {
        const app_store = useAppStore()
        const mock_store_1 = {
          $id: "withLoad",
          save: vi.fn().mockImplementation(() => {}),
          load: vi.fn().mockImplementation(() => {}),
        }
        const mock_store_2 = {
          $id: "withoutLoad",
          save: vi.fn().mockImplementation(() => {}),
        }

        app_store.registerStore(mock_store_1)
        app_store.registerStore(mock_store_2)

        const snapshot = {
          withLoad: { data: "test" },
          withoutLoad: { data: "ignored" },
        }

        app_store.load(snapshot)

        expect(mock_store_1.load).toHaveBeenCalledTimes(1)
        expect(mock_store_2.load).toBeUndefined()
      })

      test("warn when store not found in snapshot", () => {
        const app_store = useAppStore()
        const console_warn_spy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => {})
        const mock_store = {
          $id: "testStore",
          load: vi.fn().mockImplementation(() => {}),
        }

        app_store.registerStore(mock_store)
        app_store.load({})

        expect(console_warn_spy).toHaveBeenCalledWith(
          expect.stringContaining("Stores not found in snapshot: testStore"),
        )
        console_warn_spy.mockRestore()
      })
    })
  })
})
