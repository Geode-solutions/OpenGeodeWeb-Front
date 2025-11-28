import { useInfraStore } from "@ogw_front/stores/infra.js"
import { useLambdaStore } from "@ogw_front/stores/lambda.js"
import {
  useGeodeStore,
  geode_request,
  geode_connect,
  geode_launch,
} from "@ogw_front/stores/geode.js"
import {
  useViewerStore,
  viewer_request,
  viewer_connect,
  viewer_launch,
} from "@ogw_front/stores/viewer.js"
import { appMode } from "@ogw_front/utils/app_mode.js"

export default defineNuxtPlugin(() => {
  console.log("[PLUGIN] Initializing microservices plugin...")
  const infra_store = useInfraStore()

  // Register geode microservice
  console.log("[PLUGIN] Registering geode microservice")
  const geode_store = useGeodeStore()
  infra_store.register_microservice(geode_store, {
    request: geode_request,
    connect: geode_connect,
    launch: geode_launch,
  })

  // Register viewer microservice
  console.log("[PLUGIN] Registering viewer microservice")
  const viewer_store = useViewerStore()
  infra_store.register_microservice(viewer_store, {
    request: viewer_request,
    connect: viewer_connect,
    launch: viewer_launch,
  })

  // Register lambda for CLOUD mode
  if (infra_store.app_mode === appMode.CLOUD) {
    console.log("[PLUGIN] Registering lambda microservice (CLOUD mode)")
    const lambda_store = useLambdaStore()
    infra_store.register_microservice(lambda_store, {
      request: () => {
        throw new Error("Lambda does not handle requests")
      },
      connect: (store) => store.connect(),
      launch: () => lambda_store.launch(),
    })
  }

  console.log("[PLUGIN] All microservices registered")
})
