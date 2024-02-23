import _ from "lodash"

export function viewer_call(
  { schema, params = {} },
  { request_error_function, response_function, response_error_function } = {},
) {
  console.log("viewer_call", schema.route, params)
  const errors_store = use_errors_store()
  const viewer_store = use_viewer_store()

  const { valid, error } = validate_schema(schema, params)

  if (!valid) {
    errors_store.add_error({
      code: 400,
      route: schema.route,
      name: "Bad request",
      description: error,
    })
    throw new Error(schema.route.concat(": ", error))
  }

  const client = viewer_store.client

  if (!_.isEmpty(schema.properties)) {
    params = [params]
  } else {
    params = []
  }

  if (client) {
    viewer_store.start_request()
    client
      .getConnection()
      .getSession()
      .call(schema.route, params)
      .then(
        (value) => {
          if (response_function) {
            console.log("response_function", value)
            response_function(value)
          }
        },
        (reason) => {
          if (request_error_function) {
            console.log("request_error_function", reason)
            request_error_function(reason)
          }
        },
      )
      .catch((error) => {
        console.log("error : ", error)
        // errors_store.add_error({
        //   code: error.code,
        //   route: schema.route,
        //   name: error.data.message,
        //   description: error.data.exception,
        // })
        if (response_error_function) {
          response_error_function(error)
        }
      })
      .finally(() => {
        viewer_store.stop_request()
      })
  }
}

export default viewer_call