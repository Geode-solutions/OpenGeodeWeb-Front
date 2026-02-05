import pTimeout from "p-timeout"
import { useFeedbackStore } from "@ogw_front/stores/feedback"
import validate_schema from "@ogw_front/utils/validate_schema"

const ERROR_400 = 400

export async function viewer_call(
  microservice,
  { schema, params = {} },
  {
    request_error_function,
    response_function,
    response_error_function,
    timeout,
  } = {},
) {
  const feedbackStore = useFeedbackStore()

  const { valid, error } = validate_schema(schema, params)

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Bad request", error, schema, params)
    }
    feedbackStore.add_error(ERROR_400, schema.$id, "Bad request", error)
    throw new Error(`${schema.$id}: ${error}`)
  }

  const { client } = microservice

  async function performCall() {
    if (!client.getConnection) {
      return
    }
    microservice.start_request()

    try {
      const value = await client.getConnection().getSession().call(schema.$id, [params])
      if (response_function) {
        response_function(value)
      }
      return value
    } catch (error) {
      feedbackStore.add_error(
        error.code,
        schema.$id,
        error.message,
        error.message,
      )
      if (request_error_function) {
        request_error_function(error)
      }
      if (response_error_function) {
        response_error_function(error)
      }
      throw error
    } finally {
      microservice.stop_request()
    }
  }

  if (timeout !== undefined && timeout > 0) {
    return await pTimeout(performCall(), {
      milliseconds: timeout,
      message: `${schema.$id}: Timed out after ${timeout}ms`,
    })
  }

  return await performCall()
}

export default viewer_call
