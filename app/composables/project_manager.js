import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import fileDownload from "js-file-download"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

import { importWorkflowFromSnapshot } from "@ogw_f/utils/file_import_workflow"

export function useProjectManager() {
  const exportProject = async function () {
    console.log("[export triggered]")
    const appStore = useAppStore()
    const geodeStore = useGeodeStore()
    const infraStore = useInfraStore()
    const snapshot = appStore.exportStores()
    const schema = back_schemas.opengeodeweb_back.export_project
    const defaultName = "project.vease"

    await infraStore.create_connection()
    let downloaded = false
    const result = await api_fetch(
      { schema, params: { snapshot, filename: defaultName } },
      {
        response_function: function (response) {
          if (downloaded) return
          downloaded = true
          const data = response._data
          const headerName =
            (response.headers &&
              typeof response.headers.get === "function" &&
              (response.headers
                .get("Content-Disposition")
                ?.match(/filename=\"(.+?)\"/)?.[1] ||
                response.headers.get("new-file-name"))) ||
            defaultName
          if (!headerName.toLowerCase().endsWith(".vease")) {
            throw new Error("Server returned non-.vease project archive")
          }
          fileDownload(data, headerName)
        },
      },
    )
    return result
  }

  const importProjectFile = async function (file) {
    const geode = useGeodeStore()
    const viewerStore = useViewerStore()
    const dataBaseStore = useDataBaseStore()
    const treeviewStore = useTreeviewStore()
    const hybridViewerStore = useHybridViewerStore()
    const infraStore = useInfraStore()

    await infraStore.create_connection()
    await viewerStore.ws_connect()

    const client = viewerStore.client
    if (client && client.getConnection && client.getConnection().getSession) {
      await client
        .getConnection()
        .getSession()
        .call("opengeodeweb_viewer.release_database", [{}])
    }

    await viewer_call({
      schema: viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization,
      params: {},
    })

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

    const result = await $fetch(schemaImport.$id, {
      baseURL: geode.base_url,
      method: "POST",
      body: form,
    })
    const snapshot = result && result.snapshot ? result.snapshot : {}

    treeviewStore.isImporting = true

    const client2 = viewerStore.client
    if (
      client2 &&
      client2.getConnection &&
      client2.getConnection().getSession
    ) {
      await client2
        .getConnection()
        .getSession()
        .call("opengeodeweb_viewer.import_project", [{}])
    }

    await treeviewStore.importStores(snapshot.treeview)
    await hybridViewerStore.initHybridViewer()
    await hybridViewerStore.importStores(snapshot.hybridViewer)

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

    await importWorkflowFromSnapshot(items)
    await hybridViewerStore.importStores(snapshot.hybridViewer)

    {
      const dataStyleStore = useDataStyleStore()
      await dataStyleStore.importStores(snapshot.dataStyle)
    }
    {
      const dataStyleStore = useDataStyleStore()
      await dataStyleStore.applyAllStylesFromState()
    }

    treeviewStore.finalizeImportSelection()
    treeviewStore.isImporting = false
  }

  return { exportProject, importProjectFile }
}

export default useProjectManager
