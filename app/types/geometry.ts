// A coordinate along one axis of the scene or of the screen
type Coordinate = number;

// The coordinates of a point or a vector, one per axis
type Coordinates = number[];

// The bounds of a box: the minimum then the maximum along each axis
type Bounds = number[];

// An angle, in degrees
type Angle = number;

// A ratio between two lengths, such as a scale factor
type Ratio = number;

// How much the scene is stretched along the vertical axis
type ZScale = number;

export type { Angle, Bounds, Coordinate, Coordinates, Ratio, ZScale };
