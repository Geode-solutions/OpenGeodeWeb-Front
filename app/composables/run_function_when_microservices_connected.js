import { useInfraStore } from "@ogw_front/stores/infra"
export function run_function_when_microservices_connected(function_to_run) {
  const infraStore = useInfraStore()
  const { microservices_connected } = storeToRefs(infraStore)
  if (microservices_connected.value) {
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
