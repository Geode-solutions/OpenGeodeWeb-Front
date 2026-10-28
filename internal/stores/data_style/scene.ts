import type { SceneFontFamily, SceneOrientationWidget, SceneStyle } from "./types";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { getDefaultSceneStyle } from "@ogw_front/utils/default_styles";
import { getTable } from "@ogw_internal/database/database";
import { useDataStyleState } from "./state";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const text_style_schema = viewer_schemas.opengeodeweb_viewer.viewer.set_text_style;
const orientation_widget_schema = viewer_schemas.opengeodeweb_viewer.viewer.set_orientation_widget;

// oxlint-disable-next-line id-length -- the viewer schema requires { r, g, b }
function toViewerColor(color: RGBAColor): { r: number; g: number; b: number } {
  // oxlint-disable-next-line id-length -- the viewer schema requires { r, g, b }
  return { r: color.red, g: color.green, b: color.blue };
}

// oxlint-disable-next-line max-lines-per-function
export function useSceneStyle(): {
  setSceneBackgroundColor: (color: RGBAColor) => Promise<void>;
  setSceneTextColor: (color: RGBAColor) => Promise<unknown>;
  setSceneFontFamily: (font_family: SceneFontFamily) => Promise<unknown>;
  setSceneOrientationWidget: (marker: SceneOrientationWidget) => Promise<unknown>;
  applySceneStyle: () => Promise<void>;
  importSceneStyle: (snapshot: SceneStyle | undefined) => Promise<void>;
} {
  const viewerStore = useViewerStore();
  const hybridViewerStore = useHybridViewerStore();
  const { sceneStyle } = useDataStyleState();
  const sceneStyleTable = getTable<SceneStyle>("scene_style");

  async function saveSceneStyle(values: Partial<Omit<SceneStyle, "id">>): Promise<void> {
    // Values may hold nested reactive proxies (e.g. an exported snapshot), which IndexedDB cannot clone
    // oxlint-disable-next-line unicorn/prefer-structured-clone, no-unsafe-type-assertion -- JSON round-trip of a known-shape style.
    const plainStyle = JSON.parse(JSON.stringify({ ...sceneStyle.value, ...values })) as SceneStyle;
    sceneStyle.value = plainStyle;
    await sceneStyleTable.put(plainStyle);
  }

  async function requestTextStyle(text: SceneStyle["text"]): Promise<unknown> {
    // Update right away so a quick second change builds on this one instead of the saved state
    sceneStyle.value = { ...sceneStyle.value, text };
    const params = {
      color: toViewerColor(text.color),
      font_family: text.font_family,
      opacity: text.color.alpha,
    };
    const result = await viewerStore.request(
      { schema: text_style_schema, params },
      {
        response_function: async () => {
          await saveSceneStyle({ text });
        },
      },
    );
    return result;
  }

  async function requestOrientationWidget(marker: SceneOrientationWidget): Promise<unknown> {
    const result = await viewerStore.request(
      { schema: orientation_widget_schema, params: { marker } },
      {
        response_function: async () => {
          await saveSceneStyle({ orientation_widget: marker });
        },
      },
    );
    return result;
  }

  async function setSceneBackgroundColor(color: RGBAColor): Promise<void> {
    await hybridViewerStore.setBackgroundColor(toViewerColor(color));
    await saveSceneStyle({ background_color: color });
  }

  async function setSceneTextColor(color: RGBAColor): Promise<unknown> {
    const result = await requestTextStyle({ ...sceneStyle.value.text, color });
    return result;
  }

  async function setSceneFontFamily(font_family: SceneFontFamily): Promise<unknown> {
    const result = await requestTextStyle({ ...sceneStyle.value.text, font_family });
    return result;
  }

  async function setSceneOrientationWidget(marker: SceneOrientationWidget): Promise<unknown> {
    const result = await requestOrientationWidget(marker);
    return result;
  }

  async function applySceneStyle(): Promise<void> {
    const { background_color, text, orientation_widget } = sceneStyle.value;
    await Promise.all([
      setSceneBackgroundColor(background_color),
      requestTextStyle(text),
      requestOrientationWidget(orientation_widget),
    ]);
  }

  async function importSceneStyle(snapshot: SceneStyle | undefined): Promise<void> {
    const { background_color, text, orientation_widget } = snapshot ?? getDefaultSceneStyle();
    await saveSceneStyle({ background_color, text, orientation_widget });
  }

  return {
    setSceneBackgroundColor,
    setSceneTextColor,
    setSceneFontFamily,
    setSceneOrientationWidget,
    applySceneStyle,
    importSceneStyle,
  };
}
