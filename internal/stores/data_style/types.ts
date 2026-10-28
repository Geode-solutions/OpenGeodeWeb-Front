import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

type StyleValues = Record<string, unknown>;

interface ObjectStyle {
  id: string;
  visibility?: boolean;
  color?: unknown;
  points?: StyleValues;
  edges?: StyleValues;
  cells?: StyleValues;
  polygons?: StyleValues;
  polyhedra?: StyleValues;
  corners?: StyleValues;
  lines?: StyleValues;
  surfaces?: StyleValues;
  blocks?: StyleValues;
  attributes?: StyleValues;
  timeSteps?: Record<string, Record<string, number>>;
  [key: string]: unknown;
}

interface ModelComponentTypeStyle extends StyleValues {
  id_model: string;
  type: string;
}

interface ModelComponentStyle extends StyleValues {
  id_model: string;
  id_component: string;
}

type SceneFontFamily = "arial" | "courier" | "times";
type SceneOrientationWidget = "axes" | "compass";

interface SceneStyle {
  id: "scene";
  background_color: RGBAColor;
  text: {
    color: RGBAColor;
    font_family: SceneFontFamily;
  };
  orientation_widget: SceneOrientationWidget;
}

export type {
  ModelComponentStyle,
  ModelComponentTypeStyle,
  ObjectStyle,
  SceneFontFamily,
  SceneOrientationWidget,
  SceneStyle,
  StyleValues,
};
