import type { Count } from "@ogw_front/types/ui";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";

const DEFAULT_MAX_LENGTH = 16;
const DEFAULT_SLICE_START = 8;
const DEFAULT_SLICE_END_OFFSET = 8;

function formatListId(
  id: DataId | undefined | null,
  maxLength: Count = DEFAULT_MAX_LENGTH,
  sliceStart: number = DEFAULT_SLICE_START,
  sliceEndOffset: number = DEFAULT_SLICE_END_OFFSET,
): string {
  if (id === undefined || id === null || id === "") {
    return "";
  }
  if (id.length <= maxLength) {
    return id;
  }
  return `${id.slice(0, sliceStart)}...${id.slice(id.length - sliceEndOffset)}`;
}

export { formatListId };
