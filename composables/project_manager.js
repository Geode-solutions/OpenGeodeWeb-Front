import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

export function useProjectManager() {
  const appStore = useAppStore()
  const geode = useGeodeStore()

  async function exportProject() {
    geode.start_request()
    try {
      await useInfraStore().create_connection()
      const snapshot = appStore.exportStores()
      const schema = back_schemas.opengeodeweb_back.export_project
      const defaultName = "project.zip"

      await api_fetch(
        { schema, params: { snapshot, filename: defaultName } },
        {
          response_function: async (response) => {
            const contentType =
              response.headers?.get?.("content-type") || "application/zip"
            const data = response._data
            const blob =
              data instanceof Blob
                ? data
                : new Blob([data], { type: contentType })
            const downloadName =
              response.headers?.get?.("new-file-name") || defaultName
            const urlObject = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = urlObject
            a.download = downloadName
            a.click()
            URL.revokeObjectURL(urlObject)
          },
        },
      )
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
        schema: viewer_schemas.opengeodeweb_viewer.import_project,
        params: {},
      })
      await viewer_call({
        schema: viewer_schemas.opengeodeweb_viewer.reset_visualization,
        params: {},
      })

      await appStore.importStores(snapshot)
    } finally {
      geode.stop_request()
    }
  }

  return { exportProject, importProjectFile }
}
