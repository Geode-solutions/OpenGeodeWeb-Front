import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import fileDownload from "js-file-download"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

export function useProjectManager() {
  const exportProject = function () {
    console.log("[export triggered]");
    const appStore = useAppStore()
    const geode = useGeodeStore()
    const infraStore = useInfraStore()
    const snapshot = appStore.exportStores()
    const schema = back_schemas.opengeodeweb_back.export_project
    const defaultName = "project.vease"

    return infraStore
      .create_connection()
      .then(function () {
        let downloaded = false
        return api_fetch(
          { schema, params: { snapshot, filename: defaultName } },
          {
            response_function: function (response) {
              if (downloaded) return
              downloaded = true
              const data = response._data
              const headerName =
                (response.headers &&
                  typeof response.headers.get === "function" &&
                  (
                    response.headers.get("Content-Disposition")
                      ?.match(/filename=\"(.+?)\"/)?.[1] ||
                    response.headers.get("new-file-name")
                  )) ||
                defaultName
              if (!headerName.toLowerCase().endsWith(".vease")) {
                throw new Error("Server returned non-.vease project archive")
              }
              fileDownload(data, headerName)
            },
          },
        )
      })
      .finally(function () {
        geode.stop_request()
      })
  }

  const importProjectFile = function (file) {
    const geode = useGeodeStore()
    const viewerStore = useViewerStore()
    const dataBaseStore = useDataBaseStore()
    const treeviewStore = useTreeviewStore()
    const hybridViewerStore = useHybridViewerStore()
    const infraStore = useInfraStore()

    return infraStore
      .create_connection()
      .then(function () {
        return viewerStore.ws_connect()
      })
      .then(function () {
        return viewer_call({
          schema: viewer_schemas.opengeodeweb_viewer.import_project,
          params: {},
        })
      })
      .then(function () {
        return viewer_call({
          schema: viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization,
          params: {},
        })
      })
      .then(function () {
        treeviewStore.clear()
        dataBaseStore.clear()
        hybridViewerStore.clear()

        const schemaImport = back_schemas.opengeodeweb_back.import_project
        const form = new FormData()
        const originalFileName = file && file.name ? file.name : "project.vease"
        if (!originalFileName.toLowerCase().endsWith(".vease")) {
          throw new Error("Uploaded file must be a .vease")
        }
        form.append("file", file, originalFileName)

        return $fetch(schemaImport.$id, {
          baseURL: geode.base_url,
          method: "POST",
          body: form,
        })
      })
      .then(function (result) {
        const snapshot = result && result.snapshot ? result.snapshot : {}

        treeviewStore.isImporting = true

        return Promise.resolve()
          .then(function () {
            return treeviewStore.importStores(snapshot.treeview)
          })
          .then(function () {
            return hybridViewerStore.initHybridViewer()
          })
          .then(function () {
            return hybridViewerStore.importStores(snapshot.hybridViewer)
          })
          .then(function () {
            const snapshotDataBase =
              snapshot && snapshot.dataBase && snapshot.dataBase.db
                ? snapshot.dataBase.db
                : {}
            const items = Object.entries(snapshotDataBase).map(function (pair) {
              const id = pair[0]
              const item = pair[1]
              const binaryLightViewable =
                item && item.vtk_js && item.vtk_js.binary_light_viewable
                  ? item.vtk_js.binary_light_viewable
                  : undefined
              return {
                id: id,
                object_type: item.object_type,
                geode_object: item.geode_object,
                native_filename: item.native_filename,
                viewable_filename: item.viewable_filename,
                displayed_name: item.displayed_name,
                vtk_js: { binary_light_viewable: binaryLightViewable },
              }
            })

            return importWorkflowFromSnapshot(items)
          })
          .then(function () {
            return hybridViewerStore.importStores(snapshot.hybridViewer)
          })
          .then(function () {
            const dataStyleStore = useDataStyleStore()
            return dataStyleStore.importStores(snapshot.dataStyle)
          })
          .then(function () {
            const dataStyleStore = useDataStyleStore()
            return dataStyleStore.applyAllStylesFromState()
          })
          .then(function () {
            treeviewStore.finalizeImportSelection()
            treeviewStore.isImporting = false
          })
      })
      .finally(function () {
        geode.stop_request()
      })
  }

  return { exportProject, importProjectFile }
}

export default useProjectManager
