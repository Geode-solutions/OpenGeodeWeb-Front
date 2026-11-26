import type {
  GeodeObjectType,
  ViewerObjectType,
} from "@geode/opengeodeweb-microservice/data_types";
import { type MenuItems, menusData } from "./menu_helpers/menus_data.js";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { DataIdentified } from "@ogw_front/types/identifiers";

// What the menus of an entry are chosen by: its viewer_object_type and geode_object_type, or keys when it is not a data
type MenuViewerObjectType =
  | ViewerObjectType
  | "scene"
  | "basemap"
  | "model_component"
  | "model_component_type";
type MenuObjectType = GeodeObjectType | "scene" | "Basemap" | "Map" | "component" | "type";

interface MenuMetaData extends Partial<DataIdentified> {
  viewer_object_type?: MenuViewerObjectType;
  geode_object_type?: MenuObjectType;
  targetIds?: DataId[];
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

const MENU_RADIUS = 80;
// Same gap between neighbour items as a 4-item object menu (3 items, no center button)
const SCENE_MENU_RADIUS = 65;
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
    menuRadius,
    getMenuItems,
    closeMenu,
    openMenu,
    setMenuPosition,
    toggleItemOptions,
  };
});

export type { MenuMetaData, MenuViewerObjectType };
