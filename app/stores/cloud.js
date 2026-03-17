import { Status } from "@ogw_front/utils/status"
import { useAppStore } from "./app"
import { useFeedbackStore } from "./feedback"
import { useInfraStore } from "./infra"

export const useCloudStore = defineStore("cloud", {
  state: () => ({
    status: Status.NOT_CONNECTED,
  }),
  actions: {
    launch(name, email, launch) {
      this.status = Status.CONNECTING
      console.log("[CLOUD] Launching cloud backend...")
      const schema = {
        $id: "/api/app/run_cloud",
        methods: ["POST"],
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          launch: { type: "boolean" },
        },
        required: ["name", "email", "launch"],
        additionalProperties: true,
      }
      const params = {
        name,
        email,
        launch,
      }
      console.log("[CLOUD] params", params)
      const appStore = useAppStore()
      const feedbackStore = useFeedbackStore()
      return appStore.request(schema, params, {
        request_error_function: () => {
          feedbackStore.$patch({ server_error: true })
          this.status = Status.NOT_CONNECTED
        },
        response_function: (response) => {
          feedbackStore.$patch({ server_error: false })
          console.log(`[CLOUD] Cloud launched on ${response.url}`)
          this.status = Status.CONNECTED
          const infraStore = useInfraStore()
          infraStore.$patch({
            domain_name: response.url,
          })
        },
        response_error_function: () => {
          feedbackStore.$patch({ server_error: true })
          this.status = Status.NOT_CONNECTED
        },
      })
    },
    async connect() {
      console.log("[CLOUD] Cloud connected")
      this.status = Status.CONNECTED
      return Promise.resolve()
    },
  },
  share: {
    omit: ["status"],
  },
})
