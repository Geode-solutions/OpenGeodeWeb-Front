import type { MenusByObjectType } from "./types.js";
import SceneBackgroundOptions from "@ogw_front/components/Viewer/Scene/BackgroundOptions.vue";
import SceneOrientationWidgetOptions from "@ogw_front/components/Viewer/Scene/OrientationWidgetOptions.vue";
import SceneTextOptions from "@ogw_front/components/Viewer/Scene/TextOptions.vue";

const sceneMenus: MenusByObjectType = {
  scene: [SceneBackgroundOptions, SceneTextOptions, SceneOrientationWidgetOptions],
};

export { sceneMenus };
