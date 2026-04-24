export function useVirtualTree(propsIn, emit) {
  const props = toRef(propsIn);

  const actualItemProps = computed(() => ({
    value: "id",
    title: "title",
    children: "children",
    height: 44,
    ...props.value.itemProps,
  }));

  const actualSelection = computed(() => ({
    selectable: false,
    strategy: "classic",
    ...props.value.selection,
  }));

  const openedSet = computed(() => new Set(props.value.opened));
  const selectedSet = computed(() => new Set(props.value.selected));

  function toggleOpen(item) {
    const id = item[actualItemProps.value.value];
    const { opened: openedArray = [] } = props.value;
    const newOpened = new Set(openedArray);
    if (newOpened.has(id)) {
      newOpened.delete(id);
    } else {
      newOpened.add(id);
    }
    emit("update:opened", [...newOpened]);
  }

  function getAllChildrenIds(item, ids = []) {
    const children = item[actualItemProps.value.children];
    if (children) {
      for (const child of children) {
        ids.push(child[actualItemProps.value.value]);
        getAllChildrenIds(child, ids);
      }
    }
    return ids;
  }

  function isSelected(item) {
    const id = item[actualItemProps.value.value];
    if (selectedSet.value.has(id)) {
      return true;
    }
    if (actualSelection.value.strategy === "classic") {
      const childrenIds = getAllChildrenIds(item);
      return (
        childrenIds.length > 0 && childrenIds.every((childId) => selectedSet.value.has(childId))
      );
    }
    return false;
  }

  function getIndeterminate(item) {
    if (actualSelection.value.strategy !== "classic") {
      return false;
    }
    const childrenIds = getAllChildrenIds(item);
    if (childrenIds.length === 0) {
      return false;
    }

    const selectedChildren = childrenIds.filter((childId) => selectedSet.value.has(childId));
    return selectedChildren.length > 0 && selectedChildren.length < childrenIds.length;
  }

  function toggleSelect(item) {
    const id = item[actualItemProps.value.value];
    const { selected: selectedArray = [] } = props.value;
    const newSelected = new Set(selectedArray);
    const isCurrentlySelected = newSelected.has(id) || isSelected(item);

    if (actualSelection.value.strategy === "classic") {
      const childrenIds = getAllChildrenIds(item);
      if (isCurrentlySelected) {
        newSelected.delete(id);
        for (const childId of childrenIds) {
          newSelected.delete(childId);
        }
      } else {
        newSelected.add(id);
        for (const childId of childrenIds) {
          newSelected.add(childId);
        }
      }
    } else if (isCurrentlySelected) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    emit("update:selected", [...newSelected]);
  }

  function flattenTree(itemsList, depth = 0, result = []) {
    const { search, customFilter } = props.value;
    const lowerSearch = search ? search.toLowerCase() : "";

    for (const item of itemsList) {
      const id = item[actualItemProps.value.value];
      const children = item[actualItemProps.value.children];
      const hasChildren = children && children.length > 0;

      const isOpen = openedSet.value.has(id);

      if (lowerSearch) {
        const matches = customFilter
          ? customFilter(id, search, { raw: item })
          : (item[actualItemProps.value.title] || "").toLowerCase().includes(lowerSearch) ||
          String(id).toLowerCase().includes(lowerSearch);

        if (!hasChildren && !matches) {
          continue;
        }

        if (hasChildren) {
          const subtree = [];
          flattenTree(children, depth + 1, subtree);
          if (subtree.length === 0 && !matches) {
            continue;
          }

          result.push({
            raw: item,
            id,
            depth,
            isOpen: true,
            isLeaf: false,
          });
          result.push(...subtree);
          continue;
        }
      }

      result.push({
        raw: item,
        id,
        depth,
        isOpen,
        isLeaf: !hasChildren,
      });

      if (isOpen && hasChildren) {
        flattenTree(children, depth + 1, result);
      }
    }
    return result;
  }

  const displayItems = computed(() => flattenTree(props.value.items || []));

  return {
    actualItemProps,
    actualSelection,
    displayItems,
    toggleOpen,
    toggleSelect,
    isSelected,
    getIndeterminate,
  };
}
