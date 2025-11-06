// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

// Local imports

async function importWorkflow(files) {
  console.log("importWorkflow", { files })
  const promise_array = []
  for (const { filename, geode_object } of files) {
    console.log({ filename }, { geode_object })
    const id = await importFile(filename, geode_object)
    promise_array.push(id)
  }
  return promise_array
}

async function importFile(filename, geode_object) {
  const dataBaseStore = useDataBaseStore()
  const dataStyleStore = useDataStyleStore()
  const treeviewStore = useTreeviewStore()
  const hybridViewerStore = useHybridViewerStore()
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

  console.log("[importFile] response", {
    id,
    geode_object,
    input_file: data._value?.input_file,
    name,
  })

  await dataBaseStore.registerObject(id)
  await dataBaseStore.addItem(id, {
    object_type,
    geode_object,
    native_filename: native_file_name,
    viewable_filename: viewable_file_name,
    displayed_name: name,
    vtk_js: { binary_light_viewable },
  })

  await treeviewStore.addItem(geode_object, name, id, object_type)
  await hybridViewerStore.addItem(id)

  await dataStyleStore.addDataStyle(id, geode_object, object_type)
  if (object_type === "model") {
    await Promise.all([
      dataBaseStore.fetchMeshComponents(id),
      dataBaseStore.fetchUuidToFlatIndexDict(id),
    ])
  }
  await dataStyleStore.applyDefaultStyle(id)
  return id
}

async function importWorkflowFromSnapshot(items) {
  const dataBaseStore = useDataBaseStore()
  const treeviewStore = useTreeviewStore()
  const hybridViewerStore = useHybridViewerStore()
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

    await treeviewStore.addItem(geode_object, displayed_name, id, object_type)
    await hybridViewerStore.addItem(id)

    ids.push(id)
  }
  return ids
}

export { importFile, importWorkflow, importWorkflowFromSnapshot }
