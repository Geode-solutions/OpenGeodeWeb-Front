import Ajv from "ajv"

export function viewer_call(
  { schema, params = {} },
  { request_error_function, response_function, response_error_function } = {},
) {
  console.log("viewer_call schema", schema)
  const errors_store = use_errors_store()
  const viewer_store = use_viewer_store()

  const ajv = new Ajv()
  const valid = ajv.validate(schema, params)

  if (!valid) {
    errors_store.add_error({
      code: 400,
      route: schema.$id,
      name: "Bad request",
      description: ajv.errorsText(),
    })
    throw new Error(schema.$id.concat(": ", ajv.errorsText()))
  }

  const client = viewer_store.client

  if (client) {
    viewer_store.start_request()
    client.getRemote()
    session
      .call(function_name, [params])
      .vtk[schema["$id"]](params)
      .then((response) => {
        if (response_function) {
          response_function(response)
        }
      })
      .catch((response) => {
        errors_store.add_error({
          code: response.status,
          route: schema.$id,
          name: response._data.name,
          description: response._data.description,
        })
        if (response_error_function) {
          response_error_function(response)
        }
      })
    viewer_store.stop_request()
  }
}

export default viewer_call
