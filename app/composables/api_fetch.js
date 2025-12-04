import _ from "lodash"
import validate_schema from "@/utils/validate_schema.js"

export function api_fetch(
  { schema, params },
  { request_error_function, response_function, response_error_function } = {},
) {
  const feedback_store = useFeedbackStore()
  const geode_store = useGeodeStore()

  const body = params || {}

  const { valid, error } = validate_schema(schema, body)

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Bad request", error, schema, params)
    }
    feedback_store.add_error(400, schema.$id, "Bad request", error)
    throw new Error(schema.$id.concat(": ", error))
  }

  geode_store.start_request()

  const method = schema.methods.filter((m) => m !== "OPTIONS")[0]
  const request_options = {
    method: method,
  }
  if (!_.isEmpty(body)) {
    request_options.body = body
  }

  if (schema.max_retry) {
    request_options.max_retry = schema.max_retry
  }
  return useFetch(schema.$id, {
    baseURL: geode_store.base_url,
    ...request_options,
    async onRequestError({ error }) {
      await geode_store.stop_request()
      await feedback_store.add_error(
        error.code,
        schema.$id,
        error.message,
        error.stack,
      )
      if (request_error_function) {
        await request_error_function(error)
      }
    },
    async onResponse({ response }) {
      if (response.ok) {
        await geode_store.stop_request()
        if (response_function) {
          await response_function(response)
        }
      }
    },
    async onResponseError({ response }) {
      await geode_store.stop_request()
      await feedback_store.add_error(
        response.status,
        schema.$id,
        response._data.name,
        response._data.description,
      )
      if (response_error_function) {
        await response_error_function(response)
      }
    },
  })
}

export default api_fetch
