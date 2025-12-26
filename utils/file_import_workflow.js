// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import { useHybridViewerStore } from "../stores/hybrid_viewer"

// Local imports

async function importWorkflow(files) {
  console.log("importWorkflow", { files })
  const promise_array = []
  for (const file of files) {
    const { filename, geode_object_type } = file
    console.log({ filename }, { geode_object_type })
    promise_array.push(importFile(filename, geode_object_type))
  }
  return Promise.all(promise_array)
}

function buildImportItemFromPayloadApi(value, geode_object_type) {
  return {
    id: value.id,
    object_type: value.viewer_type,
    geode_object: geode_object_type,
    native_filename: value.native_file_name,
    viewable_filename: value.viewable_file_name,
    displayed_name: value.name,
    vtk_js: { binary_light_viewable: value.binary_light_viewable },
  }
}

async function importItem(item) {
  const dataBaseStore = useDataBaseStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()
  const treeviewStore = useTreeviewStore()
  await dataBaseStore.registerObject(item.id)
  await dataBaseStore.addItem(item.id, {
    object_type: item.object_type,
    geode_object_type: item.geode_object,
    native_filename: item.native_filename,
    viewable_filename: item.viewable_filename,
    name: item.displayed_name,
    vtk_js: item.vtk_js,
  })

  await treeviewStore.addItem(
    item.geode_object,
    item.displayed_name,
    item.id,
    item.object_type,
  )

  await hybridViewerStore.addItem(item.id)
  await dataStyleStore.addDataStyle(item.id, item.geode_object)

  if (item.object_type === "model") {
    await Promise.all([
      dataBaseStore.fetchMeshComponents(item.id),
      dataBaseStore.fetchUuidToFlatIndexDict(item.id),
    ])
  }

  await dataStyleStore.applyDefaultStyle(item.id)
  hybridViewerStore.remoteRender()
  return item.id
}

async function importFile(filename, geode_object_type) {
  const { data } = await api_fetch({
    schema: back_schemas.opengeodeweb_back.save_viewable_file,
    params: {
      geode_object_type,
      filename: filename,
    },
  })

  console.log("data.value", data.value)

  const item = buildImportItemFromPayloadApi(data.value, geode_object_type)
  return importItem(item)
}

async function importItemFromSnapshot(item) {
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
    const id = await importItemFromSnapshot(
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
