import validate_schema from "~/app/utils/validate_schema.js"

export function viewer_call(
  { schema, params = {} },
  { request_error_function, response_function, response_error_function } = {},
) {
  const feedback_store = useFeedbackStore()
  const infra_store = useInfraStore()

  const { valid, error } = validate_schema(schema, params)

  if (!valid) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Bad request", error, schema, params)
    }
    feedback_store.add_error(400, schema.$id, "Bad request", error)
    throw new Error(schema.$id.concat(": "))
  }

  const microservice = infra_store.get_microservice("viewer")
  if (!microservice) {
    throw new Error("Viewer microservice not found")
  }

  return microservice.request(microservice.store, schema, params, {
    request_error_function,
    response_function,
    response_error_function,
  })
}

export default viewer_call
