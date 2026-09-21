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

export type { ModelComponentStyle, ModelComponentTypeStyle, ObjectStyle, StyleValues };
