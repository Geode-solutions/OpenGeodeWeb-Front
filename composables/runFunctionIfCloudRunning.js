export default async function (function_to_run) {
  const infra_store = use_infra_store()
  const { is_running } = storeToRefs(infra_store)
  if (is_running.value) {
    function_to_run()
  } else {
    watch(is_running, (value) => {
      if (value) {
        function_to_run()
      }
    })
  }
}
