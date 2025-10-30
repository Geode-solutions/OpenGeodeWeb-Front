import { useAppStore } from "@/stores/app.js"
import { useInfraStore } from "@ogw_f/stores/infra"
import { viewer_call } from "@/composables/viewer_call.js"
import { useGeodeStore } from "@/stores/geode.js"
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

export function useProjectManager() {
  const appStore = useAppStore()
  const geode = useGeodeStore()

  async function exportProject() {
    geode.start_request()
    try {
      await useInfraStore().create_connection()
      const snapshot = appStore.exportStore()

      const schema = back_schemas.opengeodeweb_back.project.export_project
      const url = `${geode.base_url}${schema.route}`
      const method = schema.methods[0]

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot }),
      })
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }
      const blob = await response.blob()
      const filename = response.headers.get("new-file-name")
      const urlObject = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = urlObject
      a.download = filename
      a.click()
      URL.revokeObjectURL(urlObject)
    } finally {
      geode.stop_request()
    }
  }

  async function importProjectFile(file) {
    geode.start_request()
    try {
      const snapshot = JSON.parse(await file.text())
      await useInfraStore().create_connection()

      await viewer_call({
        schema: viewer_schemas.opengeodeweb_viewer.utils.import_project,
        params: {},
      })
      await viewer_call({
        schema: viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization,
        params: {},
      })

      await appStore.importStore(snapshot)
    } finally {
      geode.stop_request()
    }
  }

  return { exportProject, importProjectFile }
}
