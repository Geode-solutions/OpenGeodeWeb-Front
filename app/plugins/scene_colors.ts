import { setSceneColors } from "@ogw_front/utils/default_styles";

// Hands `ogwFront.sceneColors` (app.config.ts) to the default scene style, before any data style store is created
export default defineNuxtPlugin({
  name: "ogw-scene-colors",
  enforce: "pre",
  setup() {
    setSceneColors(useAppConfig().ogwFront?.sceneColors ?? {});
  },
});
