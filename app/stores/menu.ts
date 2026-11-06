import type {
  GeodeObjectType,
  GeodeObjectTyped,
  ViewerType,
  ViewerTyped,
} from "@ogw_front/types/identifiers";
import { type MenuItems, menusData } from "./menu_helpers/menus_data.js";

interface MenuMetaData extends Partial<GeodeObjectTyped>, Partial<ViewerTyped> {
  targetIds?: string[];
  [key: string]: unknown;
}

interface OpenMenuOptions {
  readonly id: string;
  readonly x: number | undefined;
  readonly y: number | undefined;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly left: number;
  readonly meta_data: MenuMetaData | undefined;
}

export const useMenuStore = defineStore("menu", () => {
  const menus = shallowRef(menusData);
  const display_menu = ref(false);
  const current_id = ref<string | undefined>(undefined);
  const menuX = ref(0);
  const menuY = ref(0);
  const containerWidth = ref(window.innerWidth);
  const containerHeight = ref(window.innerHeight);
  const containerTop = ref(0);
  const containerLeft = ref(0);
  const active_item_index = ref<number | undefined>(undefined);
  const current_meta_data = ref<MenuMetaData>({});

  function getMenuItems(
    viewerType: ViewerType | undefined,
    geodeObjectType: GeodeObjectType | undefined,
  ): MenuItems {
    if (
      viewerType === undefined ||
      viewerType === "" ||
      geodeObjectType === undefined ||
      geodeObjectType === "" ||
      !menus.value[viewerType]
    ) {
      return [];
    }
    return menus.value[viewerType]?.[geodeObjectType] ?? [];
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
      const items = getMenuItems(meta_data.viewer_type, meta_data.geode_object_type);
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

  function setMenuPosition(x: number, y: number): void {
    menuX.value = x;
    menuY.value = y;
  }

  function toggleItemOptions(index: number): void {
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
    getMenuItems,
    closeMenu,
    openMenu,
    setMenuPosition,
    toggleItemOptions,
  };
});

export type { MenuMetaData };
