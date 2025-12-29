// Third party imports
import { describe, expect, test } from "vitest"

// Local imports
import { check_recaptcha_params } from "@ogw_front/utils/recaptcha"

describe("recaptcha", () => {
  const name = ""
  const email = ""
  const launch = false
  const internal_error = 500
  const success = 200

  describe("wrong params", () => {
    test("name", () => {
      const name = "test"
      const event = {
        body: JSON.stringify({
          name,
          email,
          launch,
        }),
      }
      const result = check_recaptcha_params(event)
      expect(result.statusCode).toBe(internal_error)
    })

    test("email", () => {
      const email = "test"
      const event = {
        body: JSON.stringify({
          name,
          email,
          launch,
        }),
      }
      const result = check_recaptcha_params(event)
      expect(result.statusCode).toBe(internal_error)
    })

    test("launch", () => {
      const launch = true
      const event = {
        body: JSON.stringify({
          name,
          email,
          launch,
        }),
      }
      const result = check_recaptcha_params(event)
      expect(result.statusCode).toBe(internal_error)
    })
  })

  describe("right params", () => {
    test("name", () => {
      const event = {
        body: JSON.stringify({
          name,
          email,
          launch,
        }),
      }
      const result = check_recaptcha_params(event)
      expect(result.statusCode).toBe(success)
    })
  })
})
