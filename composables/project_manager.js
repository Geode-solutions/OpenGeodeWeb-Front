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
      await useInfraStore().create_connection()

      const schemaImport = back_schemas.opengeodeweb_back.import_project
      const form = new FormData()
      form.append("file", file, file?.name)

      const result = await $fetch(schemaImport.$id, {
        baseURL: geode.base_url,
        method: "POST",
        body: form,
      })
      const snapshot = result?.snapshot ?? {}

      await viewer_call({
        schema: viewer_schemas.opengeodeweb_viewer.import_project,
        params: {},
      })
      await viewer_call({
        schema: viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization,
        params: {},
      })

      const treeviewStore = useTreeviewStore()
      treeviewStore.isImporting = true
      await treeviewStore.importStores(snapshot?.treeview)

      const hybridViewerStore = useHybridViewerStore()
      await hybridViewerStore.initHybridViewer()
      hybridViewerStore.clear()
      await hybridViewerStore.importStores(snapshot?.hybridViewer)

      const snapshotDataBase = snapshot?.dataBase?.db || {}
      const items = Object.entries(snapshotDataBase).map(([id, item]) => ({
        id,
        object_type: item.object_type,
        geode_object: item.geode_object,
        native_filename: item.native_filename,
        viewable_filename: item.viewable_filename,
        displayed_name: item.displayed_name,
        vtk_js: { binary_light_viewable: item?.vtk_js?.binary_light_viewable },
      }))

      await importWorkflowFromSnapshot(items)

      // Appliquer la caméra importée après avoir créé les actors
      await hybridViewerStore.importStores(snapshot?.hybridViewer)

      const dataStyleStore = useDataStyleStore()
      await dataStyleStore.importStores(snapshot?.dataStyle)
      await dataStyleStore.applyAllStylesFromState()

      treeviewStore.finalizeImportSelection()
      treeviewStore.isImporting = false
    } finally {
      geode.stop_request()
    }
  }

  return { exportProject, importProjectFile }
}

export default useProjectManager
