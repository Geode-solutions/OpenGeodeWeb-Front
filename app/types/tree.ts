import type { TreeNodeId } from "@ogw_front/types/identifiers";

// A node of a tree: what identifies it and what is displayed for it
interface TreeNode {
  id: TreeNodeId;
  title: string;
}

// A node that groups other nodes
interface TreeGroup<Child> extends TreeNode {
  children: Child[];
}

// A node that groups other nodes and whose list of children is not changed
interface ReadonlyTreeGroup<Child> extends TreeNode {
  readonly children: readonly Child[];
}

// A row of a virtual tree, by its position in the flattened list of visible rows
type TreeRowIndex = number;

// The position of a view in the layout of the object tree
type TreeViewIndex = number;

// A category the rows of a tree can be filtered by
type TreeFilterCategory = string;

export type {
  ReadonlyTreeGroup,
  TreeFilterCategory,
  TreeGroup,
  TreeNode,
  TreeRowIndex,
  TreeViewIndex,
};
