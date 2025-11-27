import _ from "lodash"
import validate_schema from "@/app/utils/validate_schema.js"

export function api_fetch(
  { schema, params, microservice_name = "geode" },
  { request_error_function, response_function, response_error_function } = {},
) {
  const feedback_store = useFeedbackStore()
  const infra_store = useInfraStore()

  const body = params || {}

  const { valid, error } = validate_schema(schema, body)

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Bad request", error, schema, params)
    }
    feedback_store.add_error(400, schema.$id, "Bad request", error)
    throw new Error(schema.$id.concat(": ", error))
  }

  const microservice = infra_store.get_microservice(microservice_name)
  if (!microservice) {
    throw new Error(`Microservice ${microservice_name} not found`)
  }

  return microservice.request(microservice.store, schema, params, {
    request_error_function,
    response_function,
    response_error_function,
  })
}

export default api_fetch
