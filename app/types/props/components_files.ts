import type { DisplayText } from "@ogw_front/types/ui";
import type { useStepperTree } from "@ogw_front/composables/stepper_tree";

// The state of a stepper: its steps and the current one
type StepperTree = ReturnType<typeof useStepperTree>;

// The texts a drag and drop zone displays while idle, while a file is dragged over it and while loading
interface DragAndDropTexts {
  idle: DisplayText;
  drop: DisplayText;
  loading: DisplayText;
}

export type { DragAndDropTexts, StepperTree };
