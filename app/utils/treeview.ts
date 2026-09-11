function compareSelections<T>(current: T[], previous: T[]): { added: T[]; removed: T[] } {
  const added = current.filter((item) => !previous.includes(item));
  const removed = previous.filter((item) => !current.includes(item));
  return { added, removed };
}

export { compareSelections };
