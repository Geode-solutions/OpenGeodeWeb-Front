// What an attribute of a data is called
type AttributeName = string;

// Which item of an attribute colors a data, an attribute having one or several items
type AttributeItem = number;

// The name of the color map that colors a data by an attribute
type AttributeColorMap = string;

// Which time step of its series an attribute is read at, an index into the time steps of the attribute
type AttributeTimeStep = number;

// The lower bound of the range an attribute coloring covers
type AttributeRangeMinimum = number;

// The upper bound of the range an attribute coloring covers
type AttributeRangeMaximum = number;

// The range an attribute coloring covers, a bound being undefined until one is stored for it
type AttributeRange = [
  minimum: AttributeRangeMinimum | undefined,
  maximum: AttributeRangeMaximum | undefined,
];

// A range of an attribute with both of its bounds set
type ValidAttributeRange = [minimum: AttributeRangeMinimum, maximum: AttributeRangeMaximum];

export type {
  AttributeColorMap,
  AttributeItem,
  AttributeName,
  AttributeRange,
  AttributeRangeMaximum,
  AttributeRangeMinimum,
  AttributeTimeStep,
  ValidAttributeRange,
};
