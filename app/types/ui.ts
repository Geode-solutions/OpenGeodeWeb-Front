// An icon, by its mdi or phosphor name
type IconName = string;

// The source of an image displayed in the interface: a url, a path or a data url
type ImageSource = string;

// A CSS or vuetify color, such as "primary" or "#ff0000"
type CssColor = string;

// A tab of a style card: "model", "type", "component" or "components"
type TabName = string;

// What a tree is sorted by: "name" or "id"
type SortType = "name" | "id";

// The data-testid of an element
type TestId = string;

// A key of a keyboard event, such as "ArrowDown" or "Enter"
type KeyboardKey = string;

// The position of an item in a menu
type MenuItemIndex = number;

// The format a color picker shows a color in
type ColorMode = "rgb" | "rgba";

// The size of a component: a vuetify size name or a number of pixels
type ComponentSize = string | number;

// The position of a step in a stepper
type StepIndex = number;

// A factor a filter applies to a data, such as the shrink factor
type FilterFactor = number;

// The title of an element, a dialog or an item, as displayed to the user
type Title = string;

// The label of a field, a button or an option, as displayed to the user
type Label = string;

// A piece of text displayed to the user
type DisplayText = string;

// The text of a tooltip
type Tooltip = string;

// A longer text that explains an item, as displayed to the user
type Description = string;

// A message that tells the user what went wrong or what happened
type Message = string;

// What the user typed to search or filter a list
type SearchQuery = string;

// A length on the screen, in pixels
type Pixels = number;

// A position in a list
type Index = number;

// A number of items, characters or occurrences
type Count = number;

export type {
  ColorMode,
  ComponentSize,
  Count,
  CssColor,
  Description,
  DisplayText,
  FilterFactor,
  IconName,
  ImageSource,
  Index,
  KeyboardKey,
  Label,
  MenuItemIndex,
  Message,
  Pixels,
  SearchQuery,
  SortType,
  StepIndex,
  TabName,
  TestId,
  Title,
  Tooltip,
};
