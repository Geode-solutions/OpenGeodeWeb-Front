import Ajv from "ajv"
import _ from "lodash"

export function viewer_call(
  { schema, params = {} },
  { request_error_function, response_function, response_error_function } = {},
) {
  const errors_store = use_errors_store()
  const viewer_store = use_viewer_store()

  const ajv = new Ajv()
  ajv.addKeyword("route")
  const valid = ajv.validate(schema, params)

  if (!valid) {
    errors_store.add_error({
      code: 400,
      route: schema.route,
      name: "Bad request",
      description: ajv.errorsText(),
    })
    throw new Error(schema.route.concat(": ", ajv.errorsText()))
  }

  const client = viewer_store.client

  console.log("viewer_call", schema.route, params)

  if (!_.isEmpty(schema.properties)) {
    params = [params]
  }

  if (client) {
    viewer_store.start_request()
    client
      .getConnection()
      .getSession()
      .call(schema.route, params)
      .then((response) => {
        if (response_function) {
          response_function(response)
        }
      })
      .catch((response) => {
        console.log("error : ", response)
        errors_store.add_error({
          code: response.code,
          route: schema.route,
          name: response.data.message,
          description: response.data.exception,
        })
        if (response_error_function) {
          response_error_function(response)
        }
      })
    viewer_store.stop_request()
  }
}

export default viewer_call
