import back_schemas from "@geode/opengeodeweb-back/schemas.json"
import Status from "@ogw_f/utils/status.js"

export const use_geode_store = defineStore("geode", () => {
  const default_local_port = "5000";
  const request_counter = ref(0);
  const status = ref(Status.NOT_CONNECTED);

  function getProtocol() {
    if (use_infra_store().is_cloud) {
      return "https"
    }
    return "http"
  }

  function getPort() {
    if (use_infra_store().is_cloud) {
      return "443"
    }
    return default_local_port
  }

  function getBaseUrl() {
    const infra_store = use_infra_store()
    let geode_url = `${getProtocol()}://${infra_store.domain_name}:${getPort()}`
    if (infra_store.is_cloud) {
      if (infra_store.ID == "") {
        throw new Error("ID must not be empty in cloud mode")
      }
      geode_url += `/${infra_store.ID}/geode`
    }
    return geode_url
  }

  const is_busy = computed(() => {
    return request_counter.value > 0
  });

  function ping_task() {
    setInterval(() => {
      if (status.value == Status.CONNECTED) {
        do_ping()
      }
    }, 10 * 1000)
  }

  async function do_ping() {
    const geode_store = this
    const feedback_store = use_feedback_store()
    return useFetch(back_schemas.opengeodeweb_back.ping.$id, {
      baseURL: getBaseUrl(),
      method: back_schemas.opengeodeweb_back.ping.methods[0],
      body: {},
      onRequestError({ error }) {
        feedback_store.server_error = true
        status.value = Status.NOT_CONNECTED
      },
      onResponse({ response }) {
        if (response.ok) {
          feedback_store.server_error = false
          status.value = Status.CONNECTED
        }
      },
      onResponseError({ response }) {
        feedback_store.server_error = true
        status.value = Status.NOT_CONNECTED
      },
    })
  }

  function start_request() {
    request_counter.value++
  }

  function stop_request() {
    request_counter.value--
  }

  return {
    request_counter,
    status,
    getProtocol,
    getPort,
    getBaseUrl,
    is_busy,
    ping_task,
    do_ping,
    start_request,
    stop_request,
  }
})
