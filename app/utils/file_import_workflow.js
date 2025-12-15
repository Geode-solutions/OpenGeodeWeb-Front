// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

// Local imports
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useDataBaseStore } from "@ogw_front/stores/data_base"
import { useTreeviewStore } from "@ogw_front/stores/treeview"

async function importWorkflow(files) {
  console.log("importWorkflow", { files })
  const promise_array = []
  for (const file of files) {
    const { filename, geode_object_type } = file
    console.log({ filename }, { geode_object_type })
    promise_array.push(importFile(filename, geode_object_type))
  }
  const results = await Promise.all(promise_array)
  const hybridViewerStore = useHybridViewerStore()
  hybridViewerStore.remoteRender()
  return results
}

function buildImportItemFromPayloadApi(value, geode_object_type) {
  console.log("buildImportItemFromPayloadApi", { value, geode_object_type })
  return {
    ...value,
  }
}

async function importItem(item) {
  const dataBaseStore = useDataBaseStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()
  const treeviewStore = useTreeviewStore()
  console.log("importItem", { item })
  try {
    await dataBaseStore.registerObject(item.id)
  } catch (error) {
    console.warn(
      `[Import] Failed to register object ${item.id} in backend viewer:`,
      error,
    )
  }
  await dataBaseStore.addItem(item.id, {
    ...item,
  })

  await treeviewStore.addItem(
    item.geode_object_type,
    item.name,
    item.id,
    item.viewer_type,
  )

  await hybridViewerStore.addItem(item.id)
  await dataStyleStore.addDataStyle(item.id, item.geode_object_type)

  if (item.viewer_type === "model") {
    await Promise.all([
      dataBaseStore.fetchMeshComponents(item.id),
      dataBaseStore.fetchUuidToFlatIndexDict(item.id),
    ])
  }

  await dataStyleStore.applyDefaultStyle(item.id)
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

  const item = buildImportItemFromPayloadApi(
    response.data.value,
    geode_object_type,
  )
  return importItem(item)
}

async function importWorkflowFromSnapshot(items) {
  console.log("[importWorkflowFromSnapshot] start", { count: items?.length })
  const dataBaseStore = useDataBaseStore()
  const treeviewStore = useTreeviewStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const ids = []
  for (const item of items) {
    const id = await importItem(
      item,
      dataBaseStore,
      treeviewStore,
      dataStyleStore,
      hybridViewerStore,
    )
    ids.push(id)
  }
  hybridViewerStore.remoteRender()
  console.log("[importWorkflowFromSnapshot] done", { ids })
  return ids
}

export { importFile, importWorkflow, importWorkflowFromSnapshot, importItem }
