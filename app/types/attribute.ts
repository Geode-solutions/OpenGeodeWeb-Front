// What an attribute of a data is called
type AttributeName = string;

// Which item of an attribute colors a data, an attribute having one or several items
type AttributeItem = number;

// A range of an attribute with both of its bounds set
type ValidAttributeRange = [minimum: number, maximum: number];

export type { AttributeItem, AttributeName, ValidAttributeRange };
