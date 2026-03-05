// Third party imports
import { describe, expect, test } from "vitest"

// Local imports
import { check_recaptcha_params } from "@ogw_front/utils/recaptcha"

describe("recaptcha", () => {
  const default_name = ""
  const default_email = ""
  const default_launch = false
  const internal_error = 500
  const success = 200

  describe("wrong params", () => {
    test("name", () => {
      const name = "test"
      const result = check_recaptcha_params(name, default_email, default_launch)
      expect(result.statusCode).toBe(internal_error)
    })

    test("email", () => {
      const email = "test"
      const result = check_recaptcha_params(default_name, email, default_launch)
      expect(result.statusCode).toBe(internal_error)
    })

    test("launch", () => {
      const launch = true
      const result = check_recaptcha_params(default_name, default_email, launch)
      expect(result.statusCode).toBe(internal_error)
    })
  })

  describe("right params", () => {
    test("name", () => {
      const result = check_recaptcha_params(
        default_name,
        default_email,
        default_launch,
      )
      expect(result.statusCode).toBe(success)
    })
  })
})
