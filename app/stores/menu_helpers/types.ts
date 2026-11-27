import type {
  GeodeObjectType,
  ViewerObjectType,
} from "@geode/opengeodeweb-microservice/data_types";
import type { Component } from "vue";

type MenuItems = Component[];

// What the menus of an entry are chosen by: its viewer_object_type and geode_object_type, or keys when it is not a data
type MenuViewerObjectType =
  | ViewerObjectType
  | "scene"
  | "basemap"
  | "model_component"
  | "model_component_type";
type MenuObjectType = GeodeObjectType | "scene" | "Basemap" | "Map" | "component" | "type";

// The menu items of each object type of a viewer object type
type MenusByObjectType = Partial<Record<MenuObjectType, MenuItems>>;

export type { MenuItems, MenuObjectType, MenusByObjectType, MenuViewerObjectType };
