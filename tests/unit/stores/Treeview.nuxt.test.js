import { beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

import { useTreeviewStore } from "@ogw_front/stores/treeview"

beforeEach(async () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })
  setActivePinia(pinia)
})

describe("Treeview Store", () => {
  describe("state", () => {
    test("initial state", () => {
      const treeviewStore = useTreeviewStore()
      expectTypeOf(treeviewStore.items).toBeArray()
    })
  })

  describe("actions", () => {
    describe("addItem", () => {
      test("test items sorted", () => {
        const treeviewStore = useTreeviewStore()

        const testItems = [
          {
            geode_object_type: "BRep",
            name: "test_brep.og_brep",
            id: "1",
            viewer_type: "model",
          },
          {
            geode_object_type: "BRep",
            name: "test_brep_2.og_brep",
            id: "2",
            viewer_type: "model",
          },
          {
            geode_object_type: "EdgedCurve2D",
            name: "test_edgedcurve.og_edc2d",
            id: "2",
            viewer_type: "mesh",
          },
        ]

        for (let i = 0; i < testItems.length; i++) {
          treeviewStore.addItem(
            testItems[i].geode_object_type,
            testItems[i].name,
            testItems[i].id,
            testItems[i].viewer_type,
          )
          expect(treeviewStore.items.sort()).toBe(treeviewStore.items)
          for (let i = 0; i < treeviewStore.items.length; i++) {
            expect(treeviewStore.items[i].children.sort()).toBe(
              treeviewStore.items[i].children,
            )
          }
        }
      })
    })
  })
})
