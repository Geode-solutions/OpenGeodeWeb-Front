import { describe, expect, expectTypeOf, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"
import { useTreeviewStore } from "@ogw_front/stores/treeview"

// CONSTANTS
const STEP_1 = 1

function setup() {
  const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
  setActivePinia(pinia)
}

describe("treeview store state", () => {
  test("initial state", () => {
    setup()
    const treeviewStore = useTreeviewStore()
    expectTypeOf(treeviewStore.items).toBeArray()
  })
})

describe("treeview store actions", () => {
  test("addItem sorted check", () => {
    setup()
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

    for (let i = 0; i < testItems.length; i += STEP_1) {
      treeviewStore.addItem(
        testItems[i].geode_object_type,
        testItems[i].name,
        testItems[i].id,
        testItems[i].viewer_type,
      )
      const itemsCopy = [...treeviewStore.items]
      expect(treeviewStore.items).toStrictEqual(itemsCopy.toSorted())

      for (let j = 0; j < treeviewStore.items.length; j += STEP_1) {
        const childrenCopy = [...treeviewStore.items[j].children]
        expect(treeviewStore.items[j].children).toStrictEqual(
          childrenCopy.toSorted(),
        )
      }
    }
  })
})
