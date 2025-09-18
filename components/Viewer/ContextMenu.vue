<template>
  <v-menu
    v-model="show_menu"
    content-class="circular-menu"
    :style="getMenuStyle()"
    :close-on-content-click="false"
    :close-delay="100"
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
          :itemProps="{
            id: props.id,
            tooltip_location: getTooltipLocation(index),
            tooltip_origin: getTooltipOrigin(index),
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
  const menuStore = useMenuStore()
  const dataBaseStore = useDataBaseStore()

  const props = defineProps({
    id: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    containerWidth: { type: Number, required: true },
    containerHeight: { type: Number, required: true },
  })

  const meta_data = computed(() => {
    const itemId = props.id || menuStore.current_id
    return itemId ? dataBaseStore.itemMetaDatas(itemId) : {}
  })

  const radius = 80
  const show_menu = ref(true)
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragStartY = ref(0)
  const menuX = ref(props.x || menuStore.menuX)
  const menuY = ref(props.y || menuStore.menuY)

  watch(show_menu, (newVal) => {
    if (!newVal && isDragging.value) {
      setTimeout(() => {
        show_menu.value = true
      }, 10)
    }
  })

  const menu_items = computed(() =>
    menuStore.getMenuItems(
      meta_data.value.object_type,
      meta_data.value.geode_object,
    ),
  )

  const menuItemCount = computed(() => menu_items.value.length)

  function startDrag(e) {
    isDragging.value = true
    dragStartX.value = e.clientX - menuX.value
    dragStartY.value = e.clientY - menuY.value
    document.addEventListener("mousemove", handleDrag)
    document.addEventListener("mouseup", stopDrag)
    e.preventDefault()
  }

  function handleDrag(e) {
    if (!isDragging.value) return
    menuX.value = e.clientX - dragStartX.value
    menuY.value = e.clientY - dragStartY.value

    menuX.value = Math.min(
      Math.max(menuX.value, radius),
      props.containerWidth - radius,
    )
    menuY.value = Math.min(
      Math.max(menuY.value, radius),
      props.containerHeight - radius,
    )
  }

  function stopDrag(e) {
    isDragging.value = false
    document.removeEventListener("mousemove", handleDrag)
    document.removeEventListener("mouseup", stopDrag)
    e.stopPropagation()
    menuStore.setMenuPosition(menuX.value, menuY.value)
  }

  function getMenuStyle() {
    return {
      left: `${menuX.value - radius}px`,
      top: `${menuY.value - radius}px`,
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
      transition: "opacity 0.1s ease, transform 0.1s ease",
      position: "absolute",
    }
  }

  onUnmounted(() => {
    document.removeEventListener("mousemove", handleDrag)
    document.removeEventListener("mouseup", stopDrag)
  })
</script>

<style scoped>
  .circular-menu {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.8);
    user-select: none;
    cursor: grab;
    z-index: 1000;
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
  }

  .menu-item-wrapper {
    position: absolute;
    transform-origin: center;
    will-change: transform, opacity;
  }
</style>
