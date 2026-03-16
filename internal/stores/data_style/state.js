import { liveQuery } from "dexie"
import { useObservable } from "@vueuse/rxjs"
import { database } from "../../database/database"

export const useDataStyleStateStore = defineStore("dataStyleState", () => {
  const styles = useObservable(
    liveQuery(async () => {
      const allStyles = await database.data_style.toArray()
      return allStyles.reduce((acc, style) => {
        acc[style.id] = style
        return acc
      }, {})
    }),
    { initialValue: {} },
  )

  const objectVisibility = computed(() => (id) => {
    if (styles.value[id]) {
      return styles.value[id].visibility
    }
    return false
  })

  const selectedObjects = computed(() => {
    const selection = []
    for (const [id, value] of Object.entries(styles.value)) {
      if (value.visibility === true) {
        selection.push(id)
      }
    }
    return selection
  })

  const componentStyles = useObservable(
    liveQuery(async () => {
      const all = await database.model_component_datastyle.toArray()
      return all.reduce((acc, style) => {
        const key = `${style.id_model}_${style.id_component}`
        acc[key] = style
        return acc
      }, {})
    }),
    { initialValue: {} },
  )

  function getStyle(id) {
    const default_style = {
      visibility: true,
      color: { r: 1, g: 1, b: 1 },
      corners: { visibility: true, color: { r: 1, g: 1, b: 1 } },
      lines: { visibility: true, color: { r: 1, g: 1, b: 1 } },
      surfaces: { visibility: true, color: { r: 1, g: 1, b: 1 } },
      blocks: { visibility: true, color: { r: 1, g: 1, b: 1 } },
      points: { visibility: true, size: 10 },
      edges: { visibility: true },
      cells: {
        visibility: true,
        coloring: {
          active: "color",
          color: { r: 1, g: 1, b: 1 },
          cell: { name: "", storedConfigs: {} },
          vertex: { name: "", storedConfigs: {} },
          textures: [],
        },
      },
      polygons: {
        visibility: true,
        coloring: {
          active: "color",
          color: { r: 1, g: 1, b: 1 },
          polygon: { name: "", storedConfigs: {} },
          vertex: { name: "", storedConfigs: {} },
          textures: [],
        },
      },
      polyhedra: {
        visibility: true,
        coloring: {
          active: "color",
          color: { r: 1, g: 1, b: 1 },
          polyhedron: { name: "", storedConfigs: {} },
          vertex: { name: "", storedConfigs: {} },
        },
      },
    }
    if (styles.value[id]) {
      return { ...default_style, ...styles.value[id] }
    }
    return default_style
  }

  async function updateStyle(id, style) {
    await database.data_style.put(JSON.parse(JSON.stringify({ id, ...style })))
  }

  async function mutateStyle(id, mutationCallback) {
    const style = getStyle(id)
    mutationCallback(style)
    await updateStyle(id, style)
  }

  function getComponentStyle(id_model, id_component) {
    const key = `${id_model}_${id_component}`
    return componentStyles.value[key] || {}
  }

  async function updateComponentStyle(id_model, id_component, style) {
    await database.model_component_datastyle.put(
      JSON.parse(
        JSON.stringify({
          id_model,
          id_component,
          ...style,
        }),
      ),
    )
  }

  async function bulkUpdateComponentStyles(updates) {
    await database.model_component_datastyle.bulkPut(
      JSON.parse(JSON.stringify(updates)),
    )
  }

  async function mutateComponentStyle(id_model, id_component, mutationCallback) {
    const style = getComponentStyle(id_model, id_component)
    mutationCallback(style)
    await updateComponentStyle(id_model, id_component, style)
  }

  async function mutateComponentStyles(
    id_model,
    id_components,
    mutationCallback,
  ) {
    const all_styles = await database.model_component_datastyle
      .where("id_model")
      .equals(id_model)
      .toArray()
    const stylesMap = all_styles.reduce((acc, s) => {
      acc[s.id_component] = s
      return acc
    }, {})

    const updates = id_components.map((id_component) => {
      const style = stylesMap[id_component] || { id_model, id_component }
      mutationCallback(style)
      return style
    })

    await bulkUpdateComponentStyles(updates)
  }

  async function clear() {
    await database.data_style.clear()
    await database.model_component_datastyle.clear()
  }

  return {
    getStyle,
    updateStyle,
    mutateStyle,
    getComponentStyle,
    updateComponentStyle,
    mutateComponentStyle,
    mutateComponentStyles,
    styles,
    componentStyles,
    objectVisibility,
    selectedObjects,
    clear,
  }
})
