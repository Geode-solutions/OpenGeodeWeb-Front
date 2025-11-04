import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import fileDownload from "js-file-download"

export function useProjectManager() {
  const geode = useGeodeStore()
  const appStore = useAppStore()

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
            const data = response._data
            const downloadName =
              response.headers?.get?.("new-file-name") || defaultName
            fileDownload(data, downloadName)
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
      const infra = useInfraStore()
      await infra.create_connection()

      const form = new FormData()
      form.append("file", file, file.name || "project.zip")

      const importPath =
        back_schemas.opengeodeweb_back.import_project?.$id ||
        "opengeodeweb_back/import_project"

      const result = await $fetch(importPath, {
        baseURL: geode.base_url,
        method: "POST",
        body: form,
      })

      await viewer_call({
        schema: viewer_schemas.opengeodeweb_viewer.import_project,
        params: {},
      })
      await viewer_call({
        schema: viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization,
        params: {},
      })

      const dataBaseStore = useDataBaseStore()
      const treeviewStore = useTreeviewStore()
      treeviewStore.isImporting = true

      await appStore.importStores(result.snapshot)

      treeviewStore.isImporting = false
    } finally {
      geode.stop_request()
    }
  }

  return { exportProject, importProjectFile }
}

export default useProjectManager
