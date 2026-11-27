import type { DataIdentified, TreeNodeId } from "@ogw_front/types/identifiers";
import type { MenuItemIndex, Pixels } from "@ogw_front/types/ui";
import type { MenuItems, MenuObjectType, MenuViewerObjectType } from "./menu_helpers/types.js";
import type { Coordinate } from "@ogw_front/types/geometry";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import { menusData } from "./menu_helpers/menus_data.js";

interface MenuMetaData extends Partial<DataIdentified> {
  viewer_object_type?: MenuViewerObjectType;
  geode_object_type?: MenuObjectType;
  targetIds?: DataId[];
  [key: string]: unknown;
}

interface OpenMenuOptions {
  readonly id: TreeNodeId;
  readonly x: Coordinate | undefined;
  readonly y: Coordinate | undefined;
  readonly width: Pixels;
  readonly height: Pixels;
  readonly top: Pixels;
  readonly left: Pixels;
  readonly meta_data: MenuMetaData | undefined;
}

const MENU_RADIUS = 80;
// Same gap between neighbour items as a 4-item object menu (3 items, no center button)
const SCENE_MENU_RADIUS = 65;
export const useMenuStore = defineStore("menu", () => {
  const menus = shallowRef(menusData);
  const display_menu = ref(false);
  const current_id = ref<TreeNodeId | undefined>(undefined);
  const menuX = ref(0);
  const menuY = ref(0);
  const containerWidth = ref(window.innerWidth);
  const containerHeight = ref(window.innerHeight);
  const containerTop = ref(0);
  const containerLeft = ref(0);
  const active_item_index = ref<MenuItemIndex | undefined>(undefined);
  const current_meta_data = ref<MenuMetaData>({});
  const menuRadius = computed(() =>
    current_meta_data.value.viewer_object_type === "scene" ? SCENE_MENU_RADIUS : MENU_RADIUS,
  );

  function getMenuItems(
    viewerObjectType: MenuViewerObjectType | undefined,
    geodeObjectType: MenuObjectType | undefined,
  ): MenuItems {
    if (
      viewerObjectType === undefined ||
      geodeObjectType === undefined ||
      !menus.value[viewerObjectType]
    ) {
      return [];
    }
    return menus.value[viewerObjectType]?.[geodeObjectType] ?? [];
  }

  function closeMenu(): void {
    active_item_index.value = undefined;
    current_id.value = undefined;
    current_meta_data.value = {};
    menuX.value = 0;
    menuY.value = 0;
    display_menu.value = false;
  }

  function openMenu(options: OpenMenuOptions): void {
    const { id, x, y, width, height, top, left, meta_data } = options;
    closeMenu();

    if (meta_data) {
      const items = getMenuItems(meta_data.viewer_object_type, meta_data.geode_object_type);
      if (items.length === 0) {
        return;
      }
    }

    current_id.value = id;
    current_meta_data.value = meta_data ?? {};

    if (x !== undefined && y !== undefined) {
      menuX.value = x;
      menuY.value = y;
    }

    containerWidth.value = width;
    containerHeight.value = height;
    containerTop.value = top;
    containerLeft.value = left;

    display_menu.value = true;
  }

  function setMenuPosition(x: Coordinate, y: Coordinate): void {
    menuX.value = x;
    menuY.value = y;
  }

  function toggleItemOptions(index: MenuItemIndex): void {
    if (active_item_index.value === index) {
      active_item_index.value = undefined;
    } else {
      active_item_index.value = index;
    }
  }

  const router = useRouter();
  watch(
    () => router.currentRoute.value.path,
    () => {
      if (display_menu.value || active_item_index.value !== null) {
        closeMenu();
      }
    },
  );

  return {
    display_menu,
    current_id,
    current_meta_data,
    menuX,
    menuY,
    containerWidth,
    containerHeight,
    containerTop,
    containerLeft,
    active_item_index,
    menuRadius,
    getMenuItems,
    closeMenu,
    openMenu,
    setMenuPosition,
    toggleItemOptions,
  };
});

export type { MenuMetaData };
export type { MenuViewerObjectType } from "./menu_helpers/types.js";
