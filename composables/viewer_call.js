import _ from "lodash"

export function viewer_call(
  { schema, params = {} },
  { request_error_function, response_function, response_error_function } = {},
) {
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

  let promise = new Promise((resolve, reject) => {
    if (client) {
      viewer_store.start_request()
      client
        .getConnection()
        .getSession()
        .call(schema.rpc, params)
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
          errors_store.add_error({
            code: error.code,
            route: schema.route,
            name: error.data.message,
            description: error.data.exception,
          })
          if (response_error_function) {
            response_error_function(error)
          }
          reject()
        })
        .finally(() => {
          viewer_store.stop_request()
        })
    }
  })
  return promise
}

export default viewer_call
