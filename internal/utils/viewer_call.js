import validate_schema from "@ogw_front/utils/validate_schema"
import { useFeedbackStore } from "@ogw_front/stores/feedback"

export function viewer_call(
  microservice,
  { schema, params = {} },
  { request_error_function, response_function, response_error_function } = {},
  timeout,
) {
  const feedbackStore = useFeedbackStore()

  const { valid, error } = validate_schema(schema, params)

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Bad request", error, schema, params)
    }
    feedbackStore.add_error(400, schema.$id, "Bad request", error)
    throw new Error(schema.$id.concat(": ", error))
  }

  const client = microservice.client

  return new Promise((resolve, reject) => {
    if (!client.getConnection) {
      resolve()
      return
    }
    microservice.start_request()

    if (timeout !== undefined) {
      setTimeout(() => {
        reject(
          `${schema.$id}: Timed out after ${timeout}ms, ${schema} ${params}`,
        )
      }, timeout)
    }
    client
      .getConnection()
      .getSession()
      .call(schema.$id, [params])
      .then(
        (value) => {
          if (response_function) {
            response_function(value)
          }
          resolve()
        },
        (reason) => {
          if (request_error_function) {
            request_error_function(reason)
          }
          reject()
        },
      )
      .catch((error) => {
        feedbackStore.add_error(
          error.code,
          schema.$id,
          error.message,
          error.message,
        )
        if (response_error_function) {
          response_error_function(error)
        }
        reject()
      })
      .finally(() => {
        microservice.stop_request()
      })
  })
}

export default viewer_call
