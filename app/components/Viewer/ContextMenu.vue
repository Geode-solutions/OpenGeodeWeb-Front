<script setup>
  import { useDataStore } from "@ogw_front/stores/data"
  import { useEventListener } from "@vueuse/core"
  import { useMenuStore } from "@ogw_front/stores/menu"

  const RADIUS = 80
  const MARGIN_OFFSET = 40
  const Z_INDEX_MENU = 1000
  const Z_INDEX_ACTIVE_ITEM = 10
  const Z_INDEX_BASE_ITEM = 1
  const FULL_ANGLE = 360
  const ANGLE_45 = 45
  const ANGLE_135 = 135
  const ANGLE_225 = 225
  const ANGLE_315 = 315
  const CLOSE_DELAY = 100

  const menuStore = useMenuStore()
  const dataStore = useDataStore()

  const { id, x, y, containerWidth, containerHeight } = defineProps({
    id: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    containerWidth: { type: Number, required: true },
    containerHeight: { type: Number, required: true },
  })

  const meta_data = computed(() => {
    const itemId = id || menuStore.current_id
    if (!itemId) return {}
    return dataStore.getItem(itemId).value || {}
  })

  const show_menu = ref(true)
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragStartY = ref(0)
  const menuX = ref(x)
  const menuY = ref(y)

  watch(
    () => [x, y],
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
    (event) => {
      if (!isDragging.value) return
      handleDrag(event)
    },
    { passive: true },
  )

  useEventListener(window, "mouseup", (event) => {
    if (!isDragging.value) return
    stopDrag(event)
  })

  const menu_items = shallowRef([])
  watch(
    () => [meta_data.value.viewer_type, meta_data.value.geode_object_type],
    ([viewer_type, geode_object_type]) => {
      menu_items.value = menuStore.getMenuItems(viewer_type, geode_object_type)
    },
    { immediate: true },
  )

  const menuItemCount = computed(() => menu_items.value.length)

  function startDrag(event) {
    isDragging.value = true
    dragStartX.value = event.clientX - menuX.value
    dragStartY.value = event.clientY - menuY.value
    event.preventDefault()
  }

  function clampPosition(x, y) {
    const margin = RADIUS + MARGIN_OFFSET
    return {
      x: Math.min(Math.max(x, margin), containerWidth - margin),
      y: Math.min(Math.max(y, margin), containerHeight - margin),
    }
  }

  function handleDrag(event) {
    const { x, y } = clampPosition(
      event.clientX - dragStartX.value,
      event.clientY - dragStartY.value,
    )
    menuX.value = x
    menuY.value = y
    menuStore.setMenuPosition(x, y)
  }

  function stopDrag(event) {
    isDragging.value = false
    event.stopPropagation()
    menuStore.setMenuPosition(menuX.value, menuY.value)
  }

  function getMenuStyle() {
    return {
      position: "fixed",
      left: `${menuStore.containerLeft + menuX.value - RADIUS}px`,
      top: `${menuStore.containerTop + menuY.value - RADIUS}px`,
      zIndex: Z_INDEX_MENU,
    }
  }

  function getTooltipLocation(index) {
    const angle = (index / menuItemCount.value) * FULL_ANGLE
    if (angle < ANGLE_45 || angle >= ANGLE_315) return "right"
    if (angle >= ANGLE_45 && angle < ANGLE_135) return "top"
    if (angle >= ANGLE_135 && angle < ANGLE_225) return "left"
    return "bottom"
  }

  function getTooltipOrigin(index) {
    const angle = (index / menuItemCount.value) * FULL_ANGLE
    if (angle < ANGLE_45 || angle >= ANGLE_315) return "left"
    if (angle >= ANGLE_45 && angle < ANGLE_135) return "bottom"
    if (angle >= ANGLE_135 && angle < ANGLE_225) return "right"
    return "top"
  }

  function getItemStyle(index) {
    const angle = (index / menuItemCount.value) * 2 * Math.PI
    return {
      transform: `translate(${Math.cos(angle) * RADIUS}px, ${Math.sin(angle) * RADIUS}px)`,
      transition: "opacity 0.2s ease, transform 0.2s ease",
      position: "absolute",
      zIndex:
        menuStore.active_item_index === index
          ? Z_INDEX_ACTIVE_ITEM
          : Z_INDEX_BASE_ITEM,
    }
  }
</script>

<template>
  <v-menu
    v-model="show_menu"
    content-class="circular-menu-container"
    :style="getMenuStyle()"
    :close-on-content-click="false"
    :close-delay="CLOSE_DELAY"
    :overlay="false"
  >
    <div class="circular-menu-drag-handle" @mousedown.stop="startDrag">
      <div
        class="circular-menu-items"
        :style="{ width: `${RADIUS * 2}px`, height: `${RADIUS * 2}px` }"
      >
        <component
          v-for="(item, index) in menu_items"
          :is="item"
          :key="index"
          :index="index"
          :itemProps="{
            id: id,
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
