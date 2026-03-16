// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
import { useTreeviewStore } from "@ogw_front/stores/treeview"

const SECOND = 1000

async function importWorkflow(files) {
  console.log("importWorkflow", { files })
  const start = Date.now()
  const promise_array = []
  for (const file of files) {
    const { filename, geode_object_type } = file
    console.log({ filename }, { geode_object_type })
    promise_array.push(importFile(filename, geode_object_type))
  }
  const results = await Promise.all(promise_array)
  const hybridViewerStore = useHybridViewerStore()
  hybridViewerStore.remoteRender()
  console.log("importWorkflow completed in", (Date.now() - start) / SECOND)
  return results
}

function buildImportItemFromPayloadApi(value, geode_object_type) {
  console.log("buildImportItemFromPayloadApi", { value, geode_object_type })

  return {
    ...value,
    geode_object_type: value.geode_object_type || geode_object_type,
    viewer_type: value.viewer_type,
  }
}

async function importItem(item) {
  const dataStore = useDataStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()
  const treeviewStore = useTreeviewStore()
  const registerTask = dataStore.registerObject(item.id)
  const addDataTask = dataStore.addItem(item)
  console.log({ dataStore })
  const addDataComponentsTask =
    item.viewer_type === "model"
      ? dataStore.addComponents(item)
      : Promise.resolve()
  const addDataRelationsTask =
    item.viewer_type === "model"
      ? dataStore.addComponentRelations(item)
      : Promise.resolve()
  const addTreeviewTask = treeviewStore.addItem(
    item.geode_object_type,
    item.name,
    item.id,
    item.viewer_type,
  )
  const addStyleTask = dataStyleStore.addDataStyle(
    item.id,
    item.geode_object_type,
  )
  const addViewerTask = addDataTask.then(() =>
    hybridViewerStore.addItem(item.id),
  )
  const applyStyleTask = Promise.all([
    registerTask,
    addDataComponentsTask,
    addStyleTask,
  ]).then(() => dataStyleStore.applyDefaultStyle(item.id))
  await Promise.all([
    registerTask,
    addDataTask,
    addDataComponentsTask,
    addTreeviewTask,
    addStyleTask,
    addDataRelationsTask,
    addViewerTask,
    applyStyleTask,
  ])
  return item.id
}

async function importFile(filename, geode_object_type) {
  const geodeStore = useGeodeStore()
  const response = await geodeStore.request(
    back_schemas.opengeodeweb_back.save_viewable_file,
    {
      geode_object_type,
      filename,
    },
  )

  const item = buildImportItemFromPayloadApi(response, geode_object_type)
  return importItem(item)
}

async function importWorkflowFromSnapshot(items) {
  console.log("[importWorkflowFromSnapshot] start", { count: items?.length })
  const hybridViewerStore = useHybridViewerStore()

  const ids = await Promise.all(items.map((item) => importItem(item)))
  hybridViewerStore.remoteRender()
  console.log("[importWorkflowFromSnapshot] done", { ids })
  return ids
}

export { importFile, importWorkflow, importWorkflowFromSnapshot, importItem }
