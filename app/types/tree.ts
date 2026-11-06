// A node of a tree: what identifies it and what is displayed for it
interface TreeNode {
  id: string;
  title: string;
}

// A node that groups other nodes
interface TreeGroup<Child> extends TreeNode {
  children: Child[];
}

export type { TreeGroup, TreeNode };
