// Global imports
import path from "path"

// Third party imports
import { setActivePinia } from "pinia"
import { createTestingPinia } from "@pinia/testing"

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  test,
  vi,
} from "vitest"

// Local imports
import {
  executable_name,
  executable_path,
  kill_processes,
  run_viewer,
} from "@ogw_f/utils/local"
import { useDataStyleStore } from "@ogw_f/stores/data_style"

describe("DataStyle Store", () => {
  const pinia = createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  })

  const dataStyleStore = useDataStyleStore()
  beforeEach(async () => {
    setActivePinia(pinia)
    console.log("__dirname", __dirname)
    const viewer_path = path.join(
      executable_path(
        path.join("tests", "integration", "microservices", "viewer"),
      ),
      executable_name("opengeodeweb_viewer"),
    )
    await run_viewer(viewer_path, { port: 1234, data_folder_path: "./data" })
  })

  afterEach(() => {
    kill_processes()
  })

  describe("state", () => {
    test("initial state", () => {
      expectTypeOf(true).toBeBoolean()
    })
  })
})
