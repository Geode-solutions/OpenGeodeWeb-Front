import type { ColorRGBA, Visibility } from "@geode/opengeodeweb-viewer/schema_types";
import type { DataIdentified, ModelComponentId, ModelId } from "@ogw_front/types/identifiers";

type StyleValues = Record<string, unknown>;

interface ObjectStyle extends DataIdentified {
  visibility?: Visibility;
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
  id_model: ModelId;
  type: string;
}

interface ModelComponentStyle extends StyleValues {
  id_model: ModelId;
  id_component: ModelComponentId;
}

type SceneFontFamily = "arial" | "courier" | "times";
type SceneOrientationWidget = "axes" | "compass";

interface SceneStyle {
  id: "scene";
  background_color: ColorRGBA;
  text: {
    color: ColorRGBA;
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
