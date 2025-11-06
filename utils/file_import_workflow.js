// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import { useHybridViewerStore } from "../stores/hybrid_viewer"

// Local imports

async function importWorkflow(files) {
  console.log("importWorkflow", { files })
  const results = []
  for (const { filename, geode_object } of files) {
    console.log({ filename }, { geode_object })
    const id = await importFile(filename, geode_object)
    results.push(id)
  }
  return results
}

async function importFile(filename, geode_object) {
  const dataBaseStore = useDataBaseStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()
  const treeviewStore = useTreeviewStore()
  const { data } = await api_fetch({
    schema: back_schemas.opengeodeweb_back.save_viewable_file,
    params: {
      input_geode_object: geode_object,
      filename: filename,
    },
  })

  const {
    id,
    native_file_name,
    viewable_file_name,
    name,
    object_type,
    binary_light_viewable,
  } = data._value

  console.log("data._value", data._value)

  console.log("data._value.id", data._value.id)
  await dataBaseStore.registerObject(data._value.id)
  console.log("after dataBaseStore.registerObject")
  await dataBaseStore.addItem(id, {
    object_type: object_type,
    geode_object: geode_object,
    native_filename: native_file_name,
    viewable_filename: viewable_file_name,
    displayed_name: name,
    vtk_js: {
      binary_light_viewable,
    },
  })

  // await treeviewStore.addItem(geode_object, name, id, object_type)
  // await hybridViewerStore.addItem(id)
  // console.log("after dataBaseStore.addItem")

  await dataStyleStore.addDataStyle(
    data._value.id,
    data._value.geode_object,
    data._value.object_type,
  )
  console.log("after dataStyleStore.addDataStyle")
  if (data._value.object_type === "model") {
    await Promise.all([
      dataBaseStore.fetchMeshComponents(id),
      dataBaseStore.fetchUuidToFlatIndexDict(id),
    ])
    console.log("after dataBaseStore.fetchMeshComponents")
    console.log("after dataBaseStore.fetchUuidToFlatIndexDict")
  }
  await dataStyleStore.applyDefaultStyle(id)
  console.log("after dataStyleStore.applyDefaultStyle")
  return data._value.id
}

async function importWorkflowFromSnapshot(items) {
  const dataBaseStore = useDataBaseStore()
  const ids = []
  for (const item of items) {
    const {
      id,
      object_type,
      geode_object,
      native_filename,
      viewable_filename,
      displayed_name,
      vtk_js,
    } = item

    await dataBaseStore.registerObject(id)
    await dataBaseStore.addItem(id, {
      object_type,
      geode_object,
      native_filename,
      viewable_filename,
      displayed_name,
      vtk_js,
    })

    ids.push(id)
  }
  return ids
}

export { importFile, importWorkflow, importWorkflowFromSnapshot }
