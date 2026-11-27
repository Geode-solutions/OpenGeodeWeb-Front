<script setup lang="ts">
import type { Count, MenuItemIndex } from "@ogw_front/types/ui";
import type { Component } from "vue";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import { provideMenuItemCount } from "@ogw_front/composables/circular_menu";
import { useMenuStore } from "@ogw_front/stores/menu";

// Props of the ring of items of the context menu
interface ContextMenuCircularItemsProps {
  menuItems: Component[];
  dataId: DataId;
  menuItemCount: Count;
}

const { menuItems, dataId, menuItemCount } = defineProps<ContextMenuCircularItemsProps>();

const Z_INDEX_ACTIVE_ITEM = 10;
const Z_INDEX_BASE_ITEM = 1;

const menuStore = useMenuStore();
provideMenuItemCount(() => menuItemCount);

function getItemStyle(index: MenuItemIndex): Record<string, string> {
  const angle = (index / menuItemCount) * 2 * Math.PI;
  return {
    transform: `translate(${Math.cos(angle) * menuStore.menuRadius}px, ${Math.sin(angle) * menuStore.menuRadius}px)`,
    transition: "opacity 0.2s ease, transform 0.2s ease",
    position: "absolute",
    zIndex: menuStore.active_item_index === index ? Z_INDEX_ACTIVE_ITEM : Z_INDEX_BASE_ITEM,
  };
}
</script>

<template>
  <component
    v-for="(item, index) in menuItems"
    :is="item"
    :key="index"
    :index="index"
    :data-id="dataId"
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
