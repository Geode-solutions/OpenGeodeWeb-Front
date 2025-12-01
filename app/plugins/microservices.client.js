import { useGeodeStore } from "@ogw_front/stores/geode.js"
import { useViewerStore } from "@ogw_front/stores/viewer.js"
import { useInfraStore } from "@ogw_front/stores/infra.js"
import { useDataBaseStore } from "@ogw_front/stores/data_base.js"
import { useDataStyleStore } from "@ogw_front/stores/data_style.js"
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer.js"
import { useTreeviewStore } from "@ogw_front/stores/treeview.js"

export default defineNuxtPlugin(() => {
  console.log("[PLUGIN] Initializing microservices plugin...")

  const infraStore = useInfraStore()

  // Initialize and register geode microservice
  console.log("[PLUGIN] Registering geode microservice")
  const geodeStore = useGeodeStore()
  infraStore.register_microservice(geodeStore)

  // Initialize and register viewer microservice
  console.log("[PLUGIN] Registering viewer microservice")
  const viewerStore = useViewerStore()
  infraStore.register_microservice(viewerStore)

  // Initialize stores that have export/import methods to ensure they're registered
  console.log("[PLUGIN] Initializing stores for export/import registration...")
  useDataBaseStore()
  useDataStyleStore()
  useHybridViewerStore()
  useTreeviewStore()

  console.log("[PLUGIN] All microservices registered and stores initialized")
})
