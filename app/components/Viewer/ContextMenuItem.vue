<script setup>
  import GlassCard from "@ogw_front/components/GlassCard"
  import { useTheme } from "vuetify"
  import { useMenuStore } from "@ogw_front/stores/menu"
  import { useTheme } from "vuetify"

  const CARD_WIDTH = 320
  const CARD_HEIGHT = 500
  const MARGIN = 60
  const RADIUS = 80
  const OFFSET = 40

  const menuStore = useMenuStore()
  const theme = useTheme()
  const primaryColor = computed(() => theme.current.value.colors.primary)
  const { index, itemProps, tooltip, btn_image } = defineProps({
    index: { type: Number, required: true },
    itemProps: { type: Object, required: true },
    tooltip: { type: String, required: true },
    btn_image: { type: String, required: true },
  })

  const is_active = computed(() => menuStore.active_item_index === index)
  const optionsRef = ref(undefined)
  const { height: optionsHeight } = useElementSize(optionsRef)

  const maxCardHeight = computed(() =>
    Math.min(CARD_HEIGHT, menuStore.containerHeight - OFFSET),
  )

  const optionsStyle = computed(() => {
    if (!is_active.value || !optionsHeight.value) {
      return {}
    }
    const angle = (index / itemProps.totalItems) * 2 * Math.PI
    const radius = RADIUS
    const absoluteButtonY = menuStore.menuY + Math.sin(angle) * radius
    const height = optionsHeight.value
    const margin = MARGIN
    let offsetY = 0

    if (absoluteButtonY - height / 2 < margin) {
      offsetY = margin - (absoluteButtonY - height / 2)
    } else if (
      absoluteButtonY + height / 2 >
      menuStore.containerHeight - margin
    ) {
      offsetY =
        menuStore.containerHeight - margin - (absoluteButtonY + height / 2)
    }
    return { top: `calc(50% + ${offsetY}px)` }
  })

  const optionsClass = computed(() => {
    const loc = itemProps.tooltip_location
    const margin = MARGIN
    const radius = RADIUS
    if (loc === "right") {
      return menuStore.menuX + radius + margin + CARD_WIDTH >
        menuStore.containerWidth
        ? "options-left"
        : "options-right"
    }
    return menuStore.menuX - radius - margin - CARD_WIDTH < 0
      ? "options-right"
      : "options-left"
  })

  function toggleOptions() {
    menuStore.toggleItemOptions(index)
  }
</script>
<template>
  <v-sheet class="menu-item-container transition-swing" color="transparent">
    <v-tooltip
      :location="itemProps.tooltip_location"
      :origin="itemProps.tooltip_origin"
    >
      <template v-slot:activator="{ props: tooltipProps }">
        <v-btn
          icon
          :active="is_active"
          @click.stop="toggleOptions"
          v-bind="tooltipProps"
          class="menu-btn bg-white border"
          elevation="2"
        >
          <v-img :src="btn_image" height="28" width="28" />
        </v-btn>
      </template>
      <span>{{ tooltip }}</span>
    </v-tooltip>

    <v-sheet
      v-if="is_active"
      ref="optionsRef"
      class="menu-options d-flex align-center pa-0"
      :class="optionsClass"
      :style="optionsStyle"
      color="transparent"
      @click.stop
    >
      <GlassCard
        @click.stop
        :title="props.tooltip"
        width="320"
        :max-height="maxCardHeight"
        :ripple="false"
        variant="panel"
        padding="pa-0"
        class="elevation-24"
      >
        <v-card-text class="pa-5">
          <slot name="options" />
        </v-card-text>
      </GlassCard>
    </v-sheet>
  </v-sheet>
</template>

<style scoped>
  .menu-item-container {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s ease;
  }

  .menu-btn {
    transition: all 0.2s ease;
    border-color: rgba(0, 0, 0, 0.1) !important;
  }

  .menu-btn:hover {
    transform: scale(1.1);
    background-color: #e3f2fd !important;
  }

  .menu-btn.v-btn--active {
    background-color: v-bind(primaryColor) !important;
    color: white !important;
  }

  .menu-btn.v-btn--active ::v-deep(.v-img__img) {
    filter: invert(100%);
  }

  .menu-options {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1001;
  }

  .options-right {
    left: 60px;
  }

  .options-left {
    right: 60px;
  }
</style>
