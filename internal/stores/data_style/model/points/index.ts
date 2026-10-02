// Local imports
import { useModelPointsCommonStyle } from "./common";
import { useModelPointsSizeStyle } from "./size";
import { useModelPointsVisibilityStyle } from "./visibility";
import { whenDefined } from "@ogw_internal/stores/data_style/when_defined";

export function useModelPointsStyle(): {
  applyModelPointsStyle: (id: string) => Promise<unknown[]>;
} & ReturnType<typeof useModelPointsCommonStyle> &
  ReturnType<typeof useModelPointsVisibilityStyle> &
  ReturnType<typeof useModelPointsSizeStyle> {
  const modelPointsCommonStyle = useModelPointsCommonStyle();
  const modelPointsVisibilityStyle = useModelPointsVisibilityStyle();
  const modelPointsSizeStyle = useModelPointsSizeStyle();

  async function applyModelPointsStyle(id: string): Promise<unknown[]> {
    const style = modelPointsCommonStyle.modelPointsStyle(id);
    const result = await Promise.all([
      whenDefined(
        // oxlint-disable-next-line no-unsafe-type-assertion -- points style values are dynamically typed at runtime.
        style.visibility as boolean | undefined,
        async (visibility) => {
          const applied = await modelPointsVisibilityStyle.setModelPointsVisibility(id, visibility);
          return applied;
        },
      ),
      whenDefined(
        // oxlint-disable-next-line no-unsafe-type-assertion -- points style values are dynamically typed at runtime.
        style.size as number | undefined,
        async (size) => {
          const applied = await modelPointsSizeStyle.setModelPointsSize(id, size);
          return applied;
        },
      ),
    ]);
    return result;
  }

  return {
    applyModelPointsStyle,
    ...modelPointsCommonStyle,
    ...modelPointsVisibilityStyle,
    ...modelPointsSizeStyle,
  };
}
