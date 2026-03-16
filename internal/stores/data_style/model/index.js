import { liveQuery } from "dexie"
import { useObservable } from "@vueuse/rxjs"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"
import { database } from "@ogw_internal/database/database"
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
import { useModelBlocksStyle } from "./blocks"
import { useModelCornersStyle } from "./corners"
import { useModelEdgesStyle } from "./edges"
import { useModelLinesStyle } from "./lines"
import { useModelPointsStyle } from "./points"
import { useModelSurfacesStyle } from "./surfaces"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_schemas = viewer_schemas.opengeodeweb_viewer.model

export function useModelStyle() {
  const dataStore = useDataStore()
  const dataStyleStateStore = useDataStyleStateStore()
  const modelCornersStyleStore = useModelCornersStyle()
  const modelBlocksStyleStore = useModelBlocksStyle()
  const modelEdgesStyleStore = useModelEdgesStyle()
  const modelLinesStyleStore = useModelLinesStyle()
  const modelPointsStyleStore = useModelPointsStyle()
  const modelSurfacesStyleStore = useModelSurfacesStyle()
  const hybridViewerStore = useHybridViewerStore()
  const viewerStore = useViewerStore()

  function modelVisibility(id) {
    return dataStyleStateStore.getStyle(id).visibility
  }
  function setModelVisibility(id, visibility) {
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.visibility = visibility
      })
      hybridViewerStore.setVisibility(id, visibility)
      console.log(setModelVisibility.name, { id }, modelVisibility(id))
    }

    if (model_schemas.visibility) {
      return viewerStore.request(
        model_schemas.visibility,
        { id, visibility },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  function visibleMeshComponents(id_ref) {
    const selection = ref([])
    watch(
      () => (isRef(id_ref) ? id_ref.value : id_ref),
      (newId, oldId, onCleanup) => {
        if (!newId) return
        const observable = liveQuery(async () => {
          const components = await database.model_components
            .where("id")
            .equals(newId)
            .toArray()
          if (components.length === 0) return []

          const all_styles = await database.model_component_datastyle
            .where("id_model")
            .equals(newId)
            .toArray()
          const styles = all_styles.reduce((acc, s) => {
            acc[s.id_component] = s
            return acc
          }, {})

          const current_selection = []
          const meshTypes = ["Corner", "Line", "Surface", "Block"]
          const componentsByType = components.reduce((acc, c) => {
            if (!meshTypes.includes(c.type)) return acc
            if (!acc[c.type]) acc[c.type] = []
            acc[c.type].push(c.geode_id)
            return acc
          }, {})

          for (const [type, geode_ids] of Object.entries(componentsByType)) {
            let all_visible = true
            for (const gid of geode_ids) {
              const style = styles[gid]
              const is_visible = style === undefined ? true : style.visibility
              if (is_visible) {
                current_selection.push(gid)
              } else {
                all_visible = false
              }
            }
            if (all_visible) {
              current_selection.push(type)
            }
          }
          console.log("visibleMeshComponents result:", {
            id: newId,
            selection: current_selection,
          })
          return current_selection
        })

        const subscription = observable.subscribe({
          next: (val) => {
            if (JSON.stringify(val) === JSON.stringify(selection.value)) return
            console.log("visibleMeshComponents update:", { id: newId, val })
            selection.value = val
          },
          error: (err) => console.error("visibleMeshComponents error:", err),
        })

        onCleanup(() => {
          console.log("visibleMeshComponents cleanup:", { id: newId })
          subscription.unsubscribe()
        })
      },
      { immediate: true },
    )
    return selection
  }

  function modelMeshComponentVisibility(id, component_type, component_id) {
    if (component_type === "Corner") {
      return modelCornersStyleStore.modelCornerVisibility(id, component_id)
    } else if (component_type === "Line") {
      return modelLinesStyleStore.modelLineVisibility(id, component_id)
    } else if (component_type === "Surface") {
      return modelSurfacesStyleStore.modelSurfaceVisibility(id, component_id)
    } else if (component_type === "Block") {
      return modelBlocksStyleStore.modelBlockVisibility(id, component_id)
    }
    throw new Error(`Unknown model component_type: ${component_type}`)
  }

  function modelColor(id) {
    return dataStyleStateStore.getStyle(id).color
  }
  function setModelColor(id, color) {
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.color = color
      })
      console.log(setModelColor.name, { id }, modelColor(id))
    }

    if (model_schemas.color) {
      return viewerStore.request(
        model_schemas.color,
        { id, color },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  async function setModelMeshComponentsVisibility(
    id,
    component_geode_ids,
    visibility,
  ) {
    const categoryIds = ["Corner", "Line", "Surface", "Block"]
    const expanded_ids = []
    let found_type = null

    const all_components = await database.model_components
      .where({ id })
      .toArray()
    const mesh_components = all_components.reduce((acc, c) => {
      if (!acc[c.type]) acc[c.type] = []
      acc[c.type].push(c)
      return acc
    }, {})

    for (const gid of component_geode_ids) {
      if (categoryIds.includes(gid)) {
        // Part 2: Robust Toggling - Expand category ID to all its children
        const children = mesh_components[gid] || []
        expanded_ids.push(...children.map((c) => c.geode_id))
        found_type = gid
      } else {
        expanded_ids.push(gid)
      }
    }

    const filtered_ids = [...new Set(expanded_ids)] // Unique IDs only
    if (filtered_ids.length === 0) return

    const component_type =
      found_type || (await dataStore.meshComponentType(id, filtered_ids[0]))

    if (component_type === "Corner") {
      return modelCornersStyleStore.setModelCornersVisibility(
        id,
        filtered_ids,
        visibility,
      )
    } else if (component_type === "Line") {
      return modelLinesStyleStore.setModelLinesVisibility(
        id,
        filtered_ids,
        visibility,
      )
    } else if (component_type === "Surface") {
      return modelSurfacesStyleStore.setModelSurfacesVisibility(
        id,
        filtered_ids,
        visibility,
      )
    } else if (component_type === "Block") {
      return modelBlocksStyleStore.setModelBlocksVisibility(
        id,
        filtered_ids,
        visibility,
      )
    } else {
      console.warn(`Unknown model component_type: ${component_type}`)
    }
  }

  function applyModelStyle(id) {
    const style = dataStyleStateStore.getStyle(id)
    const promise_array = []
    for (const [key, value] of Object.entries(style)) {
      if (key === "visibility") {
        promise_array.push(setModelVisibility(id, value))
      } else if (key === "color") {
        promise_array.push(setModelColor(id, value))
      } else if (key === "corners") {
        promise_array.push(modelCornersStyleStore.applyModelCornersStyle(id))
      } else if (key === "lines") {
        promise_array.push(modelLinesStyleStore.applyModelLinesStyle(id))
      } else if (key === "surfaces") {
        promise_array.push(modelSurfacesStyleStore.applyModelSurfacesStyle(id))
      } else if (key === "blocks") {
        promise_array.push(modelBlocksStyleStore.applyModelBlocksStyle(id))
      } else if (key === "points") {
        promise_array.push(modelPointsStyleStore.applyModelPointsStyle(id))
      } else if (key === "edges") {
        promise_array.push(modelEdgesStyleStore.applyModelEdgesStyle(id))
      } else if (
        key === "cells" ||
        key === "polygons" ||
        key === "polyhedra" ||
        key === "id"
      ) {
        // Mesh components or record ID style application is handled elsewhere or not needed here
        continue
      } else {
        throw new Error(`Unknown model key: ${key}`)
      }
    }
    return Promise.all(promise_array)
  }

  async function setModelMeshComponentsDefaultStyle(id) {
    const item = await dataStore.item(id)
    if (!item) {
      return []
    }
    const { mesh_components } = item
    const promise_array = []
    if ("Corner" in mesh_components) {
      promise_array.push(modelCornersStyleStore.setModelCornersDefaultStyle(id))
    }
    if ("Line" in mesh_components) {
      promise_array.push(modelLinesStyleStore.setModelLinesDefaultStyle(id))
    }
    if ("Surface" in mesh_components) {
      promise_array.push(
        modelSurfacesStyleStore.setModelSurfacesDefaultStyle(id),
      )
    }
    if ("Block" in mesh_components) {
      promise_array.push(modelBlocksStyleStore.setModelBlocksDefaultStyle(id))
    }
    return promise_array
  }

  return {
    modelVisibility,
    visibleMeshComponents,
    modelMeshComponentVisibility,
    setModelVisibility,
    setModelColor,
    setModelMeshComponentsVisibility,
    applyModelStyle,
    setModelMeshComponentsDefaultStyle,
    ...useModelBlocksStyle(),
    ...useModelCornersStyle(),
    ...useModelEdgesStyle(),
    ...useModelLinesStyle(),
    ...useModelPointsStyle(),
    ...useModelSurfacesStyle(),
  }
}
