import { useAppStore } from "@/stores/app_store.js"
import { useInfraStore } from "@ogw_f/stores/infra"
import { viewer_call } from "@/composables/viewer_call.js"

export default defineNuxtPlugin(() => {
  const appStore = useAppStore()

  async function exportProject() {
    const snapshot = appStore.save()
    const blob = new Blob([JSON.stringify(snapshot)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `project_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importProjectFile(file) {
    const snapshot = JSON.parse(await file.text())
    await useInfraStore().create_connection()
    viewer_call({})
    await appStore.load(snapshot)
  }

  return {
    provide: {
      project: { export: exportProject, importFile: importProjectFile }
    }
  }
})