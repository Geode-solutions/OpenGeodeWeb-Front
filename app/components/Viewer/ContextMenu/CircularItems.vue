<script setup>
import { useMenuStore } from "@ogw_front/stores/menu";

const { menuItems, id, metaData, menuItemCount } = defineProps({
  menuItems: { type: Array, required: true },
  id: { type: String, required: true },
  metaData: { type: Object, required: true },
  menuItemCount: { type: Number, required: true },
});

const RADIUS = 80;
const Z_INDEX_ACTIVE_ITEM = 10;
const Z_INDEX_BASE_ITEM = 1;
const FULL_ANGLE = 360;
const ANGLE_45 = 45;
const ANGLE_135 = 135;
const ANGLE_225 = 225;
const ANGLE_315 = 315;

const menuStore = useMenuStore();

function getItemStyle(index) {
  const angle = (index / menuItemCount) * 2 * Math.PI;
  return {
    transform: `translate(${Math.cos(angle) * RADIUS}px, ${Math.sin(angle) * RADIUS}px)`,
    transition: "opacity 0.2s ease, transform 0.2s ease",
    position: "absolute",
    zIndex: menuStore.active_item_index === index ? Z_INDEX_ACTIVE_ITEM : Z_INDEX_BASE_ITEM,
  };
}

function getTooltipLocation(index) {
  const angle = (index / menuItemCount) * FULL_ANGLE;
  if (angle < ANGLE_45 || angle >= ANGLE_315) {
    return "right";
  }
  if (angle >= ANGLE_45 && angle < ANGLE_135) {
    return "top";
  }
  if (angle >= ANGLE_135 && angle < ANGLE_225) {
    return "left";
  }
  return "bottom";
}

function getTooltipOrigin(index) {
  const angle = (index / menuItemCount) * FULL_ANGLE;
  if (angle < ANGLE_45 || angle >= ANGLE_315) {
    return "left";
  }
  if (angle >= ANGLE_45 && angle < ANGLE_135) {
    return "bottom";
  }
  if (angle >= ANGLE_135 && angle < ANGLE_225) {
    return "right";
  }
  return "top";
}
</script>

<template>
  <component
    v-for="(item, index) in menuItems"
    :is="item"
    :key="index"
    :index="index"
    :itemProps="{
      id: id,
      meta_data: metaData,
      tooltip_location: getTooltipLocation(index),
      tooltip_origin: getTooltipOrigin(index),
      totalItems: menuItemCount,
    }"
    class="menu-item-wrapper"
    :style="getItemStyle(index)"
    @mousedown.stop
  />
</template>

<style scoped>
.menu-item-wrapper {
  position: absolute;
  transform-origin: center;
  will-change: transform, opacity;
}
</style>
