import { useInfraStore } from "@ogw_front/stores/infra.js"
import { useLambdaStore } from "@ogw_front/stores/lambda.js"
import { useGeodeStore, geode_request, geode_connect } from "@ogw_front/stores/geode.js"
import { useViewerStore, viewer_request, viewer_connect } from "@ogw_front/stores/viewer.js"
import { appMode } from "@ogw_front/utils/app_mode.js"

export default defineNuxtPlugin({
  name: "microservices",
  hooks: {
    "app:beforeMount"() {
      console.log("[OGW MICROSERVICES PLUGIN] Initializing microservices...")
      const infra_store = useInfraStore()
      
      // Register geode microservice
      console.log("[OGW MICROSERVICES PLUGIN] Registering geode microservice")
      infra_store.register_microservice({
        name: "geode",
        useStore: useGeodeStore,
        request: geode_request,
        connect: geode_connect,
      })
      
      // Register viewer microservice
      console.log("[OGW MICROSERVICES PLUGIN] Registering viewer microservice")
      infra_store.register_microservice({
        name: "viewer",
        useStore: useViewerStore,
        request: viewer_request,
        connect: viewer_connect,
      })
      
      // Register lambda for CLOUD mode
      if (infra_store.app_mode === appMode.CLOUD) {
        console.log("[OGW MICROSERVICES PLUGIN] Registering lambda microservice (CLOUD mode)")
        infra_store.register_microservice({
          name: "lambda",
          useStore: useLambdaStore,
          request: (store, schema, params, callbacks) => {
            throw new Error("Lambda store does not handle direct requests")
          },
          connect: (store) => store.connect(),
          launch: (store) => store.launch(),
        })
      }
      
      console.log("[OGW MICROSERVICES PLUGIN] Microservices registered:", 
        infra_store.microservices.map(m => m.name))
    },
  },
})
