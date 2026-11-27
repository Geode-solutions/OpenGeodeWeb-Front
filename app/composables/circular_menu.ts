import { type ComputedRef, type InjectionKey, computed, inject, provide } from "vue";
import type { Count, MenuItemIndex } from "@ogw_front/types/ui";

type MenuSide = "right" | "top" | "left" | "bottom";

const FULL_ANGLE = 360;
const ANGLE_45 = 45;
const ANGLE_135 = 135;
const ANGLE_225 = 225;
const ANGLE_315 = 315;

const OPPOSITE_SIDE: Record<MenuSide, MenuSide> = {
  right: "left",
  top: "bottom",
  left: "right",
  bottom: "top",
};

const MENU_ITEM_COUNT_KEY: InjectionKey<ComputedRef<Count>> = Symbol("menu_item_count");

// The circular menu shares its item count with its items: each one places itself on the circle
function provideMenuItemCount(count: () => Count): void {
  provide(MENU_ITEM_COUNT_KEY, computed(count));
}

function injectMenuItemCount(): ComputedRef<Count> {
  return inject(MENU_ITEM_COUNT_KEY, () => computed(() => 1), true);
}

// Side of the circle an item sits on, where its tooltip shows
function menuItemSide(index: MenuItemIndex, count: Count): MenuSide {
  const angle = (index / count) * FULL_ANGLE;
  if (angle < ANGLE_45 || angle >= ANGLE_315) {
    return "right";
  }
  if (angle < ANGLE_135) {
    return "top";
  }
  if (angle < ANGLE_225) {
    return "left";
  }
  return "bottom";
}

export { OPPOSITE_SIDE, injectMenuItemCount, menuItemSide, provideMenuItemCount };
export type { MenuSide };
