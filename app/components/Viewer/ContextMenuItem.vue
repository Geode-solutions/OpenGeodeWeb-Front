<template>
  <div class="menu-item">
    <v-tooltip
      :location="props.itemProps.tooltip_location"
      :origin="props.itemProps.tooltip_origin"
    >
      <template v-slot:activator="{ props: tooltipProps }">
        <v-btn
          icon
          :active="is_active"
          @click.stop="toggleOptions"
          v-bind="tooltipProps"
          class="menu-btn bg-blue-lighten-5"
        >
          <v-img :src="btn_image" height="28" width="28" />
        </v-btn>
      </template>
      <span>{{ props.tooltip }}</span>
    </v-tooltip>
    <div
      v-if="is_active"
      class="menu-options pa-0"
      :class="optionsClass"
      @click.stop
    >
      <v-card
        @click.stop
        :title="props.tooltip"
        class="options-card"
        width="320"
        max-height="500"
        :ripple="false"
      >
        <v-card-text class="options-content">
          <slot name="options" />
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
  import { useMenuStore } from "@ogw_front/stores/menu"
  const menuStore = useMenuStore()

  const props = defineProps({
    index: { type: Number, required: true },
    itemProps: { type: Object, required: true },
    tooltip: { type: String, required: true },
    btn_image: { type: String, required: true },
  })

  const is_active = computed(() => menuStore.active_item_index === props.index)

  const optionsClass = computed(() => {
    const loc = props.itemProps.tooltip_location
    const isRightish = loc === "right" || loc === "top"
    const cardWidth = 320
    const margin = 60
    const radius = 80

    if (isRightish) {
      if (
        menuStore.menuX + radius + margin + cardWidth >
        menuStore.containerWidth
      ) {
        return "options-left"
      }
      return "options-right"
    } else {
      if (menuStore.menuX - radius - margin - cardWidth < 0) {
        return "options-right"
      }
      return "options-left"
    }
  })

  function toggleOptions() {
    menuStore.toggleItemOptions(props.index)
  }
</script>

<style scoped>
  .menu-item {
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
    background-color: white !important;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }

  .menu-btn:hover {
    background-color: #e3f2fd !important;
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  }

  .menu-btn.v-btn--active {
    background-color: rgb(var(--v-theme-primary)) !important;
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    color: white !important;
  }

  .menu-btn.v-btn--active ::v-deep(.v-img__img) {
    filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg)
      brightness(100%) contrast(100%);
  }

  .menu-options {
    position: absolute;
    top: 50%;
    z-index: 1001;
  }

  .options-right {
    left: 60px;
    transform: translateY(-50%);
  }

  .options-left {
    right: 60px;
    transform: translateY(-50%);
  }

  .options-card {
    background-color: rgba(30, 30, 30, 0.85) !important;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.7);
    border-radius: 20px !important;
    overflow: hidden;
    color: white !important;
  }

  .options-content {
    padding: 20px;
  }

  .options-card :v-deep(*) {
    color: white !important;
  }

  .menu-options ::v-deep(.v-list-item) {
    padding: 12px 20px;
    white-space: nowrap;
    transition: background-color 0.2s ease;
  }

  .menu-options ::v-deep(.v-list-item:hover) {
    background-color: rgba(255, 255, 255, 0.1);
    cursor: pointer;
  }

  .menu-options ::v-deep(.v-selection-control__wrapper) {
    color: rgba(255, 255, 255, 0.9) !important;
  }

  .menu-options ::v-deep(.v-switch__track) {
    background-color: rgba(255, 255, 255, 0.3) !important;
    opacity: 1 !important;
  }

  .menu-options ::v-deep(.v-selection-control--dirty .v-switch__track) {
    background-color: rgb(var(--v-theme-primary)) !important;
    opacity: 1 !important;
  }

  .menu-options ::v-deep(.v-slider-track__fill) {
    background-color: rgb(var(--v-theme-primary)) !important;
  }

  .menu-options ::v-deep(.v-slider-track__background) {
    background-color: rgba(255, 255, 255, 0.3) !important;
    opacity: 1 !important;
  }

  .menu-options ::v-deep(.v-slider-thumb__surface) {
    background-color: white !important;
  }

  .menu-options ::v-deep(.v-slider-thumb__label) {
    background-color: rgb(var(--v-theme-primary)) !important;
  }
</style>
