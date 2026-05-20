const DEFAULT_MAX_LENGTH = 16;
const DEFAULT_SLICE_START = 8;
const DEFAULT_SLICE_END_OFFSET = 8;

function formatListId(
  id,
  maxLength = DEFAULT_MAX_LENGTH,
  sliceStart = DEFAULT_SLICE_START,
  sliceEndOffset = DEFAULT_SLICE_END_OFFSET,
) {
  if (!id) {
    return "";
  }
  if (id.length <= maxLength) {
    return id;
  }
  return `${id.slice(0, sliceStart)}...${id.slice(id.length - sliceEndOffset)}`;
}

export { formatListId };
