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
    return Promise.all([
      modelPointsVisibilityStyle.setModelPointsVisibility(
        id,
        style.visibility as boolean | undefined,
      ),
      modelPointsSizeStyle.setModelPointsSize(id, style.size as number | undefined),
    ]);
  }

  return {
    applyModelPointsStyle,
    ...modelPointsCommonStyle,
    ...modelPointsVisibilityStyle,
    ...modelPointsSizeStyle,
  };
}
