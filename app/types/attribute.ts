import type {
  AttributeRangeMaximum,
  AttributeRangeMinimum,
} from "@geode/opengeodeweb-viewer/schema_types";

// The name of the color map that colors a data by an attribute
type AttributeColorMap = string;

// Which time step of its series an attribute is read at, an index into the time steps of the attribute
type AttributeTimeStep = number;

// A value of the time series of an attribute, as opposed to AttributeTimeStep which is an index into it
type AttributeTimeValue = number;

// Where an attribute is stored on a data: "vertex", "edge", "cell", "polygon" or "polyhedron"
type AttributeLocation = string;

// How a data is colored: "color", "random", "textures" or the location of an attribute ("vertex", "edge", "cell", "polygon", "polyhedron")
type ColoringType = string;

// What identifies the time series of an attribute of a data
type TimeStepKey = string;

// The range an attribute coloring covers, a bound being undefined until one is stored for it
type AttributeRange = [
  minimum: AttributeRangeMinimum | undefined,
  maximum: AttributeRangeMaximum | undefined,
];

// A range of an attribute with both of its bounds set
type ValidAttributeRange = [minimum: AttributeRangeMinimum, maximum: AttributeRangeMaximum];

export type {
  AttributeColorMap,
  AttributeLocation,
  AttributeRange,
  AttributeTimeStep,
  AttributeTimeValue,
  ColoringType,
  TimeStepKey,
  ValidAttributeRange,
};
