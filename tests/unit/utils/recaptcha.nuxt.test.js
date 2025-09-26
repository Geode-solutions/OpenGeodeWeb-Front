import { describe, expect, test } from "vitest"

import check_recaptcha_params from "@ogw_f/utils/recaptcha.js"

describe("recaptcha.js", () => {
  const name = ""
  const email = ""
  const launch = false
  describe("Wrong params", () => {
    test("name", async () => {
      const name = "test"
      const result = check_recaptcha_params(name, email, launch)
      expect(result.status).toBe(500)
    })
    test("email", async () => {
      const email = "test"
      const result = check_recaptcha_params(name, email, launch)
      expect(result.status).toBe(500)
    })
    test("launch", async () => {
      const launch = true
      const result = check_recaptcha_params(name, email, launch)
      expect(result.status).toBe(500)
    })
  })

  describe("Right params", () => {
    test("name", async () => {
      const result = check_recaptcha_params(name, email, launch)
      expect(result.status).toBe(200)
    })
  })
})
