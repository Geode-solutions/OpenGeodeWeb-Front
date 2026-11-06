// A node of a tree: what identifies it and what is displayed for it
interface TreeNode {
  id: string;
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

export type { ReadonlyTreeGroup, TreeGroup, TreeNode };
