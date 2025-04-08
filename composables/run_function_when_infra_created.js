export function run_function_when_microservices_connected(function_to_run) {
  const infra_store = use_infra_store()
  const { status } = storeToRefs(infra_store)
  if (status === Status.CREATED) {
    function_to_run()
  } else {
    watch(status, (value) => {
      if (value === Status.CREATED) {
        function_to_run()
      }
    })
  }
}

export default run_function_when_microservices_connected
