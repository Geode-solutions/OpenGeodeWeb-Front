import { setActivePinia, createPinia } from "pinia"
import { use_errors_store } from "../../stores/errors"

describe("Errors Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("add_error", () => {
    const errors_store = use_errors_store()
    expect(errors_store.errors.length).toBe(0)
    errors_store.add_error({
      code: 500,
      route: "/test",
      name: "test message",
      description: "test description",
    })
    expect(errors_store.errors.length).toBe(1)
  })

  it("delete_error", () => {
    const errors_store = use_errors_store()
    expect(errors_store.errors.length).toBe(0)
    errors_store.delete_error(0)
    expect(errors_store.errors.length).toBe(0)
  })

  it("delete_server_error", () => {
    const errors_store = use_errors_store()
    errors_store.$patch({ server_error: true })
    expect(errors_store.server_error).toBe(true)
    errors_store.delete_server_error()
    expect(errors_store.server_error).toBe(false)
  })
})
