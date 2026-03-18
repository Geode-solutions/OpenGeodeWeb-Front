import { liveQuery } from "dexie"
import { useObservable } from "@vueuse/rxjs"
import { database } from "@ogw_internal/database/database"

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
      color: { r: 255, g: 255, b: 255 },
      corners: { visibility: true, color: { r: 20, g: 20, b: 20 } },
      lines: { visibility: true, color: { r: 20, g: 20, b: 20 } },
      surfaces: { visibility: true, color: { r: 255, g: 255, b: 255 } },
      blocks: { visibility: true, color: { r: 255, g: 255, b: 255 } },
      points: { visibility: true, size: 10 },
      edges: { visibility: true },
      cells: {
        visibility: true,
        coloring: {
          active: "color",
          color: { r: 255, g: 255, b: 255 },
          cell: { name: "", storedConfigs: {} },
          vertex: { name: "", storedConfigs: {} },
          textures: [],
        },
      },
      polygons: {
        visibility: true,
        coloring: {
          active: "color",
          color: { r: 255, g: 255, b: 255 },
          polygon: { name: "", storedConfigs: {} },
          vertex: { name: "", storedConfigs: {} },
          textures: [],
        },
      },
      polyhedra: {
        visibility: true,
        coloring: {
          active: "color",
          color: { r: 255, g: 255, b: 255 },
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

  function mutateStyle(id, mutationCallback) {
    const style = getStyle(id)
    mutationCallback(style)
    return database.data_style.put(structuredClone({ id, ...style }))
  }

  function getComponentStyle(id_model, id_component) {
    const key = `${id_model}_${id_component}`
    return componentStyles.value[key] || {}
  }

  function mutateComponentStyle(id_model, id_component, mutationCallback) {
    return database.model_component_datastyle
      .get([id_model, id_component])
      .then((style) => {
        const s = style || { id_model, id_component }
        mutationCallback(s)
        return database.model_component_datastyle.put(structuredClone(s))
      })
  }

  function mutateComponentStyles(id_model, id_components, mutationCallback) {
    return database.model_component_datastyle
      .where("id_model")
      .equals(id_model)
      .toArray()
      .then((all_styles) => {
        const stylesMap = all_styles.reduce((acc, s) => {
          acc[s.id_component] = s
          return acc
        }, {})

        const updates = id_components.map((id_component) => {
          const style = stylesMap[id_component] || { id_model, id_component }
          mutationCallback(style)
          return style
        })

        return database.model_component_datastyle.bulkPut(
          structuredClone(updates),
        )
      })
  }

  function clear() {
    return Promise.all([
      database.data_style.clear(),
      database.model_component_datastyle.clear(),
    ])
  }

  return {
    getStyle,
    mutateStyle,
    getComponentStyle,
    mutateComponentStyle,
    mutateComponentStyles,
    styles,
    componentStyles,
    objectVisibility,
    selectedObjects,
    clear,
  }
})
