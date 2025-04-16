export function run_function_when_microservices_connected(function_to_run) {
  const infra_store = use_infra_store()
  const { microservices_connected } = storeToRefs(infra_store)
  if (microservices_connected) {
    function_to_run()
  } else {
    watch(microservices_connected, (value) => {
      if (value) {
        function_to_run()
      }
    })
  }
}

export default run_function_when_microservices_connected
