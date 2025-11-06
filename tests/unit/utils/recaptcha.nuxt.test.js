import { describe, expect, test } from "vitest"

import check_recaptcha_params from "@ogw_f/utils/recaptcha.js"

describe("recaptcha.js", () => {
  const name = ""
  const email = ""
  const launch = false
  const internal_error = 500
  const success = 200

  describe("Wrong params", () => {
    test("name", () => {
      const name = "test"
      const result = check_recaptcha_params(name, email, launch)
      expect(result.status).toBe(internal_error)
    })

    test("email", () => {
      const email = "test"
      const result = check_recaptcha_params(name, email, launch)
      expect(result.status).toBe(internal_error)
    })

    test("launch", () => {
      const launch = true
      const result = check_recaptcha_params(name, email, launch)
      expect(result.status).toBe(internal_error)
    })
  })

  describe("Right params", () => {
    test("name", () => {
      const result = check_recaptcha_params(name, email, launch)
      expect(result.status).toBe(success)
    })
  })
})
