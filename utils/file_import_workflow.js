// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import { useHybridViewerStore } from "../stores/hybrid_viewer"

// Local imports

function importWorkflow(files) {
  console.log("importWorkflow", { files })
  const promise_array = []
  for (const file of files) {
    const { filename, geode_object } = file
    console.log({ filename }, { geode_object })
    promise_array.push(importFile(filename, geode_object))
  }
  return Promise.all(promise_array)
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
      filename,
    },
  })

  console.log("data.value", data.value)

  const {
    id,
    native_file_name,
    viewable_file_name,
    name,
    object_type,
    binary_light_viewable,
  } = data.value

  await dataBaseStore.registerObject(id)
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

  await treeviewStore.addItem(geode_object, name, id, object_type)

  console.log("after treeviewStore.addItem")

  await hybridViewerStore.addItem(id)
  console.log("after dataBaseStore.addItem")

  await dataStyleStore.addDataStyle(id, geode_object, object_type)
  console.log("after dataStyleStore.addDataStyle")
  if (object_type === "model") {
    await Promise.all([
      dataBaseStore.fetchMeshComponents(id),
      dataBaseStore.fetchUuidToFlatIndexDict(id),
    ])
    console.log("after dataBaseStore.fetchMeshComponents")
    console.log("after dataBaseStore.fetchUuidToFlatIndexDict")
  }
  await dataStyleStore.applyDefaultStyle(id)
  console.log("after dataStyleStore.applyDefaultStyle")
  hybridViewerStore.remoteRender()
  return id
}

export { importFile, importWorkflow }
