import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelBlocksCommonStyle(): {
  modelBlocksStyle: (id: string) => StyleValues;
  modelBlockStyle: (id: string, block_id?: string) => StyleValues;
  modelBlockColoring: (id: string, block_id?: string) => StyleValues;
  mutateModelBlocksColoring: (
    id: string,
    blocks_ids: string[],
    values: StyleValues,
  ) => Promise<void>;
  mutateModelBlocksTypeColoring: (id: string, values: StyleValues) => Promise<void>;
} {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelBlocksStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).blocks ?? {};
  }

  function modelComponentTypeBlocksStyle(id: string): StyleValues {
    const defaultStyle = modelBlocksStyle(id);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(id, "Block");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelBlockStyle(id: string, block_id?: string): StyleValues {
    if (block_id === undefined) {
      return modelComponentTypeBlocksStyle(id);
    }
    const typeStyle = modelComponentTypeBlocksStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, block_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelBlockColoring(id: string, block_id?: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelBlockStyle(id, block_id).coloring as StyleValues;
  }

  async function mutateModelBlocksColoring(
    id: string,
    blocks_ids: string[],
    values: StyleValues,
  ): Promise<void> {
    await modelCommonStyle.mutateComponentStyles(id, blocks_ids, {
      coloring: values,
    });
  }

  async function mutateModelBlocksTypeColoring(id: string, values: StyleValues): Promise<void> {
    await modelCommonStyle.mutateModelComponentTypeStyle(id, "Block", {
      coloring: values,
    });
  }

  return {
    modelBlocksStyle,
    modelBlockStyle,
    modelBlockColoring,
    mutateModelBlocksColoring,
    mutateModelBlocksTypeColoring,
  };
}
