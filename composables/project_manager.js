import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import fileDownload from "js-file-download"
import { useAppStore } from "../stores/app.js"
import { useGeodeStore } from "../stores/geode.js"
import { useInfraStore } from "../stores/infra.js"
import { viewer_call } from "./viewer_call.js"
import { api_fetch } from "./api_fetch.js"

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

      const isJson = (file.name || "").toLowerCase().endsWith(".json")
      if (isJson) {
        const snapshot = JSON.parse(await file.text())
        await viewer_call({
          schema: viewer_schemas.opengeodeweb_viewer.import_project,
          params: {},
        })
        await viewer_call({
          schema: viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization,
          params: {},
        })
        await appStore.importStores(snapshot)
        return
      }

      // Import ZIP → multipart/form-data
      const form = new FormData()
      form.append("file", file, file.name || "project.zip")

      const importId =
        back_schemas.opengeodeweb_back.import_project?.$id ||
        "opengeodeweb_back/import_project"
      const importURL = new URL(
        "/" + String(importId),
        infra?.base_url || window.location.origin,
      ).toString()

      let result
      try {
        result = await $fetch(importURL, { method: "POST", body: form })
      } catch (error) {
        const status = error?.response?.status ?? error?.status
        const data = error?.response?._data ?? error?.data
        if (status === 423) {
          await viewer_call({
            schema:
              viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization,
            params: {},
          })
          result = await $fetch(importURL, { method: "POST", body: form })
        } else {
          console.error("Backend import_project erreur:", data ?? error)
        }
      }

      // Si le backend renvoie un snapshot, on met à jour les stores
      if (result?.snapshot) {
        await appStore.importStores(result.snapshot)
      }

      // Si pas de viewables prêts, on tente des conversions courantes
      const needsViewables = result?.viewables_ready === false || result == null
      if (needsViewables) {
        const candidates = [
          { input_geode_object: "BRep", filename: "native/main.og_brep" },
          {
            input_geode_object: "SurfaceMesh",
            filename: "native/main.og_mesh",
          },
        ]
        for (const c of candidates) {
          try {
            await api_fetch({
              schema: back_schemas.opengeodeweb_back.save_viewable_file,
              params: {
                input_geode_object: c.input_geode_object,
                filename: c.filename,
              },
            })
            break
          } catch (_) {
            // On ignore et on essaie le candidat suivant
          }
        }
      }

      // Synchronisation Viewer
      await viewer_call({
        schema: viewer_schemas.opengeodeweb_viewer.import_project,
        params: {},
      })
      await viewer_call({
        schema: viewer_schemas.opengeodeweb_viewer.viewer.reset_visualization,
        params: {},
      })
    } finally {
      geode.stop_request()
    }
  }

  return { exportProject, importProjectFile }
}
