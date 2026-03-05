// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
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
  const mesh_types = [
    "EdgedCurve2D",
    "EdgedCurve3D",
    "Graph",
    "HybridSolid3D",
    "LightRegularGrid2D",
    "LightRegularGrid3D",
    "PointSet2D",
    "PointSet3D",
    "PolygonalSurface2D",
    "PolygonalSurface3D",
    "PolyhedralSolid3D",
    "RasterImage2D",
    "RasterImage3D",
    "RegularGrid2D",
    "RegularGrid3D",
    "TetrahedralSolid3D",
    "TriangulatedSurface2D",
    "TriangulatedSurface3D",
  ]
  const model_types = [
    "BRep",
    "CrossSection",
    "ImplicitCrossSection",
    "ImplicitStructuralModel",
    "Section",
    "StructuralModel",
  ]

  let viewer_type = value.viewer_type
  const geode_type = value.geode_object_type || geode_object_type
  if (!viewer_type) {
    if (mesh_types.includes(geode_type)) {
      viewer_type = "mesh"
    } else if (model_types.includes(geode_type)) {
      viewer_type = "model"
    }
  }

  return {
    ...value,
    geode_object_type: geode_type,
    viewer_type: viewer_type,
  }
}

async function importItem(item) {
  const dataStore = useDataStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()
  const treeviewStore = useTreeviewStore()
  await dataStore.registerObject(item.id)
  await dataStore.addItem(item.id, {
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
    await dataStore.fetchModelComponents(item.id)
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
