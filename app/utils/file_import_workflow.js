// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import { useHybridViewerStore } from "../stores/hybrid_viewer"

// Local imports

async function importWorkflow(files) {
  console.log("importWorkflow", { files })
  const promise_array = []
  for (const file of files) {
    const { filename, geode_object } = file
    console.log({ filename }, { geode_object })
    promise_array.push(importFile(filename, geode_object))
  }
  const results = await Promise.all(promise_array)
  const hybridViewerStore = useHybridViewerStore()
  hybridViewerStore.remoteRender()
  return results
}

function buildImportItemFromPayloadApi(value, geode_object) {
  return {
    id: value.id,
    object_type: value.object_type,
    geode_object,
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
    ...item,
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
  return item.id
}

async function importFile(filename, geode_object) {
  const { data } = await api_fetch({
    schema: back_schemas.opengeodeweb_back.save_viewable_file,
    params: {
      input_geode_object: geode_object,
      filename: filename,
    },
  })

  console.log("data.value", data.value)

  const item = buildImportItemFromPayloadApi(data._value, geode_object)
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
