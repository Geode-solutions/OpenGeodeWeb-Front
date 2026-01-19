<template>
  <v-menu
    v-model="show_menu"
    content-class="circular-menu-container"
    :style="getMenuStyle()"
    :close-on-content-click="false"
    :close-delay="100"
    :overlay="false"
  >
    <div class="circular-menu-drag-handle" @mousedown.stop="startDrag">
      <div
        class="circular-menu-items"
        :style="{ width: `${radius * 2}px`, height: `${radius * 2}px` }"
      >
        <component
          v-for="(item, index) in menu_items"
          :is="item"
          :key="index"
          :index="index"
          :itemProps="{
            id: props.id,
            tooltip_location: getTooltipLocation(index),
            tooltip_origin: getTooltipOrigin(index),
            totalItems: menuItemCount,
          }"
          class="menu-item-wrapper"
          :style="getItemStyle(index)"
          @mousedown.stop
        />
      </div>
    </div>
  </v-menu>
</template>

<script setup>
  import { useMenuStore } from "@ogw_front/stores/menu"
  import { useDataStore } from "@ogw_front/stores/data"
  import { useEventListener } from "@vueuse/core"

  const menuStore = useMenuStore()
  const dataStore = useDataStore()

  const props = defineProps({
    id: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    containerWidth: { type: Number, required: true },
    containerHeight: { type: Number, required: true },
  })

  const meta_data = computed(() => {
    const itemId = props.id || menuStore.current_id
    if (!itemId) return {}
    return dataStore.getItem(itemId).value || {}
  })

  const radius = 80
  const show_menu = ref(true)
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragStartY = ref(0)
  const menuX = ref(props.x)
  const menuY = ref(props.y)

  watch(
    () => [props.x, props.y],
    ([newX, newY]) => {
      const { x, y } = clampPosition(newX, newY)
      menuX.value = x
      menuY.value = y
      menuStore.setMenuPosition(x, y)
    },
    { immediate: true },
  )

  useEventListener(
    window,
    "mousemove",
    (e) => {
      if (!isDragging.value) return
      handleDrag(e)
    },
    { passive: true },
  )

  useEventListener(window, "mouseup", (e) => {
    if (!isDragging.value) return
    stopDrag(e)
  })

  const menu_items = ref([])
  watch(
    () => [meta_data.value.viewer_type, meta_data.value.geode_object_type],
    ([v, g]) => {
      menu_items.value = menuStore.getMenuItems(v, g)
    },
    { immediate: true },
  )

  const menuItemCount = computed(() => menu_items.value.length)

  function startDrag(e) {
    isDragging.value = true
    dragStartX.value = e.clientX - menuX.value
    dragStartY.value = e.clientY - menuY.value
    e.preventDefault()
  }

  function clampPosition(x, y) {
    const margin = radius + 40
    return {
      x: Math.min(Math.max(x, margin), props.containerWidth - margin),
      y: Math.min(Math.max(y, margin), props.containerHeight - margin),
    }
  }

  function handleDrag(e) {
    const { x, y } = clampPosition(
      e.clientX - dragStartX.value,
      e.clientY - dragStartY.value,
    )
    menuX.value = x
    menuY.value = y
    menuStore.setMenuPosition(x, y)
  }

  function stopDrag(e) {
    isDragging.value = false
    e.stopPropagation()
    menuStore.setMenuPosition(menuX.value, menuY.value)
  }

  function getMenuStyle() {
    return {
      position: "fixed",
      left: `${menuStore.containerLeft + menuX.value - radius}px`,
      top: `${menuStore.containerTop + menuY.value - radius}px`,
      zIndex: 1000,
    }
  }

  function getTooltipLocation(index) {
    const angle = (index / menuItemCount.value) * 360
    if (angle < 45 || angle >= 315) return "right"
    if (angle >= 45 && angle < 135) return "top"
    if (angle >= 135 && angle < 225) return "left"
    return "bottom"
  }

  function getTooltipOrigin(index) {
    const angle = (index / menuItemCount.value) * 360
    if (angle < 45 || angle >= 315) return "left"
    if (angle >= 45 && angle < 135) return "bottom"
    if (angle >= 135 && angle < 225) return "right"
    return "top"
  }

  function getItemStyle(index) {
    const angle = (index / menuItemCount.value) * 2 * Math.PI
    return {
      transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`,
      transition: "opacity 0.2s ease, transform 0.2s ease",
      position: "absolute",
      zIndex: menuStore.active_item_index === index ? 10 : 1,
    }
  }
</script>

<style scoped>
  :deep(.circular-menu-container) {
    overflow: visible !important;
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
    contain: none !important;
  }

  .circular-menu-drag-handle {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    cursor: grab;
  }

  .circular-menu-drag-handle:active {
    cursor: grabbing;
  }

  .circular-menu-items {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: transparent;
    border: none;
  }

  .menu-item-wrapper {
    position: absolute;
    transform-origin: center;
    will-change: transform, opacity;
  }
</style>
