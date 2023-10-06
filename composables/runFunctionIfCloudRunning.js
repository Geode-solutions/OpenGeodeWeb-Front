export default function (function_to_run) {
  const cloud_store = use_cloud_store()
  const { is_running } = storeToRefs(cloud_store)

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
