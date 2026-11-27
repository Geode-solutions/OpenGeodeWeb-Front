import type { ModelComponentId } from "@ogw_front/types/identifiers";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";

// The component types of a model that have edges options: lines are edges themselves and corners have none
type ModelEdgesComponentType = "Surface" | "Block";

// The component types of a model that have points options: the points of corners are the corners themselves
type ModelPointsComponentType = "Surface" | "Line" | "Block";

// Components of a model of one type whose edges options are edited together
interface ModelEdgesTarget {
  componentType: ModelEdgesComponentType;
  componentIds: NonEmptyArray<ModelComponentId>;
}

// Components of a model of one type whose points options are edited together
interface ModelPointsTarget {
  componentType: ModelPointsComponentType;
  componentIds: NonEmptyArray<ModelComponentId>;
}

export type {
  ModelEdgesComponentType,
  ModelEdgesTarget,
  ModelPointsComponentType,
  ModelPointsTarget,
};
