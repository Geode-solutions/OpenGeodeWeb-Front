import validate_schema from "~/app/utils/validate_schema.js"

export function viewer_call(
  microservice,
  { schema, params = {} },
  { request_error_function, response_function, response_error_function } = {},
) {
  const feedback_store = useFeedbackStore()

  const { valid, error } = validate_schema(schema, params)

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Bad request", error, schema, params)
    }
    feedback_store.add_error(400, schema.$id, "Bad request", error)
    throw new Error(schema.$id.concat(": ", error))
  }

  const client = microservice.client

  return new Promise((resolve, reject) => {
    if (!client.getConnection) {
      resolve()
      return
    }
    microservice.start_request()
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
        feedback_store.add_error(
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
