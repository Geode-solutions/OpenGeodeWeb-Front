interface MenuPositionParams {
  x: number;
  y: number;
  containerWidth: number;
  containerHeight: number;
  itemCount: number;
}

interface MenuPosition {
  x: number;
  y: number;
}

const MENU_WIDTH = 340;
const MENU_BASE_HEIGHT = 55;
const MENU_ITEM_HEIGHT = 48;
const CLAMP_MARGIN = 10;

function clampMenuY(yUI: number, containerHeight: number, menuHeight: number): number {
  let clampedY = yUI;
  if (yUI + menuHeight > containerHeight - CLAMP_MARGIN) {
    clampedY = Math.max(yUI - menuHeight, CLAMP_MARGIN);
  } else {
    clampedY = Math.max(yUI, CLAMP_MARGIN);
  }
  return Math.min(Math.max(clampedY, CLAMP_MARGIN), containerHeight - menuHeight - CLAMP_MARGIN);
}

function computeMenuPosition({
  x,
  y,
  containerWidth,
  containerHeight,
  itemCount,
}: MenuPositionParams): MenuPosition {
  const menuHeight = MENU_BASE_HEIGHT + itemCount * MENU_ITEM_HEIGHT;
  const clampedX = Math.min(Math.max(x, CLAMP_MARGIN), containerWidth - MENU_WIDTH - CLAMP_MARGIN);
  const clampedY = clampMenuY(containerHeight - y, containerHeight, menuHeight);
  return { x: clampedX, y: clampedY };
}

export { computeMenuPosition };
export type { MenuPosition, MenuPositionParams };
