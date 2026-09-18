// Local imports
import { useModelPointsCommonStyle } from "./common";
import { useModelPointsSizeStyle } from "./size";
import { useModelPointsVisibilityStyle } from "./visibility";

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
      modelPointsVisibilityStyle.setModelPointsVisibility(
        id,
        // oxlint-disable-next-line no-unsafe-type-assertion -- points style values are dynamically typed at runtime.
        style.visibility as boolean | undefined,
      ),
      // oxlint-disable-next-line no-unsafe-type-assertion -- points style values are dynamically typed at runtime.
      modelPointsSizeStyle.setModelPointsSize(id, style.size as number | undefined),
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
