export async function api_fetch (request_url, request_options, { request_error_function, response_function, response_error_function } = {}) {
  const errors_store = use_errors_store()
  const cloud_store = use_cloud_store()

  return useFetch(request_url,
    {
      baseURL: cloud_store.geode_url,
      ...request_options,
      onRequestError ({ error }) {
        // MUST STAY HERE FOR EASIER DEBUG
        // console.log('onRequestError', error)
        errors_store.add_error({ "code": '', "route": request_url, 'name': error.message, 'description': error.stack })
        if (request_error_function) { request_error_function(error) }
      },
      onResponse ({ response }) {
        if (response.ok) {
          // MUST STAY HERE FOR EASIER DEBUG
          // console.log('onResponse', response)
          if (response_function) { response_function(response) }
        }
      },
      onResponseError ({ response }) {
        // MUST STAY HERE FOR EASIER DEBUG
        // console.log('onResponseError', response)
        errors_store.add_error({ "code": response.status, "route": request_url, 'name': response._data.name, 'description': response._data.description })
        if (response_error_function) { response_error_function(response) }
      }
    }
  )
}

export default api_fetch