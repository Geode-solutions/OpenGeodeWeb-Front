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

  console.log("[importFile] response", {
    id,
    geode_object,
    input_file: data._value?.input_file,
    name,
  })

  await dataBaseStore.registerObject(id)
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

  await treeviewStore.addItem(geode_object, name, id, object_type)

  console.log("after treeviewStore.addItem")

  await hybridViewerStore.addItem(id)
  console.log("after dataBaseStore.addItem")

  await dataStyleStore.addDataStyle(
    data._value.id,
    data._value.geode_object,
    data._value.object_type,
  )
  if (data._value.object_type === "model") {
    await Promise.all([
      dataBaseStore.fetchMeshComponents(id),
      dataBaseStore.fetchUuidToFlatIndexDict(id),
    ])
  }
  await dataStyleStore.applyDefaultStyle(id)
  console.log("after dataStyleStore.applyDefaultStyle")
  hybridViewerStore.remoteRender()
  return data._value.id
}

async function importWorkflowFromSnapshot(items) {
  console.log("[importWorkflowFromSnapshot] start", { count: items?.length })
  const dataBaseStore = useDataBaseStore()
  const treeviewStore = useTreeviewStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()
  const ids = []
  for (const item of items) {
    console.log("[importWorkflowFromSnapshot] item", {
      id: item.id,
      object_type: item.object_type,
      geode_object: item.geode_object,
      displayed_name: item.displayed_name,
    })

    await dataBaseStore.registerObject(item.id)
    console.log("[importWorkflowFromSnapshot] registerObject ok", item.id)

    await dataBaseStore.addItem(item.id, {
      object_type: item.object_type,
      geode_object: item.geode_object,
      native_filename: item.native_filename,
      viewable_filename: item.viewable_filename,
      displayed_name: item.displayed_name,
      vtk_js: item.vtk_js,
    })
    console.log("[importWorkflowFromSnapshot] addItem ok", item.id)

    await treeviewStore.addItem(
      item.geode_object,
      item.displayed_name,
      item.id,
      item.object_type,
    )
    console.log("[importWorkflowFromSnapshot] treeview.addItem ok", item.id)

    await hybridViewerStore.addItem(item.id)
    console.log("[importWorkflowFromSnapshot] hybridViewer.addItem ok", item.id)

    await dataStyleStore.addDataStyle(item.id, item.geode_object)
    console.log("[importWorkflowFromSnapshot] dataStyle.addDataStyle ok", item.id)

    if (item.object_type === "model") {
      await Promise.all([
        dataBaseStore.fetchMeshComponents(item.id),
        dataBaseStore.fetchUuidToFlatIndexDict(item.id),
      ])
      console.log("[importWorkflowFromSnapshot] model components fetched", item.id)
    }

    await dataStyleStore.applyDefaultStyle(item.id)
    console.log("[importWorkflowFromSnapshot] dataStyle.applyDefaultStyle ok", item.id)

    ids.push(item.id)
  }
  hybridViewerStore.remoteRender()
  console.log("[importWorkflowFromSnapshot] remoteRender called")
  console.log("[importWorkflowFromSnapshot] done", { ids })
  return ids
}

export { importFile, importWorkflow, importWorkflowFromSnapshot }
