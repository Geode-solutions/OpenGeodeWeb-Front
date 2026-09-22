import {
  isModelBlocksPolyhedronAttributeValid,
  useModelBlocksPolyhedronAttribute,
} from "./polyhedron";
import { isModelBlocksVertexAttributeValid, useModelBlocksVertexAttribute } from "./vertex";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksColor } from "./color";
import { useModelBlocksCommonStyle } from "./common";
import { useModelBlocksVisibility } from "./visibility";

interface ColorGroup {
  color: unknown;
  blocks_ids: string[];
}

interface AttributeGroup {
  name: string | undefined;
  item: number | undefined;
  minimum: number | undefined;
  maximum: number | undefined;
  colorMap: string | undefined;
  blocks_ids: string[];
}

async function setModelBlocksDefaultStyle(_id: string): Promise<void> {
  // Placeholder
}

type UseModelBlocksStyleReturn = {
  applyModelBlocksStyle: (modelId: string) => Promise<void>;
  setModelBlocksDefaultStyle: (id: string) => Promise<void>;
} & ReturnType<typeof useModelBlocksCommonStyle> &
  ReturnType<typeof useModelBlocksVisibility> &
  ReturnType<typeof useModelBlocksColor> &
  ReturnType<typeof useModelBlocksVertexAttribute> &
  ReturnType<typeof useModelBlocksPolyhedronAttribute>;

// oxlint-disable-next-line max-lines-per-function
export function useModelBlocksStyle(): UseModelBlocksStyleReturn {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelBlocksCommonStyle();
  const modelVisibilityStyle = useModelBlocksVisibility();
  const modelColorStyle = useModelBlocksColor();
  const modelBlocksVertexAttribute = useModelBlocksVertexAttribute();
  const modelBlocksPolyhedronAttribute = useModelBlocksPolyhedronAttribute();

  async function applyModelBlocksVisibilityStyle(
    modelId: string,
    blocks_ids: string[],
  ): Promise<unknown[]> {
    const visibilityGroups: Record<string, string[]> = {};
    for (const block_id of blocks_ids) {
      const style = modelCommonStyle.modelBlockStyle(modelId, block_id);
      const visibility = String(style.visibility);
      visibilityGroups[visibility] ??= [];
      visibilityGroups[visibility].push(block_id);
    }
    const result = await Promise.all(
      Object.entries(visibilityGroups).map(async ([visibility, ids]) => {
        const visibilityResult = await modelVisibilityStyle.setModelBlocksVisibility(
          modelId,
          ids,
          visibility === "true",
        );
        return visibilityResult;
      }),
    );
    return result;
  }

  async function applyModelBlocksColoringStyle(
    modelId: string,
    blocks_ids: string[],
  ): Promise<unknown[]> {
    const activeColoringGroups: Record<string, string[]> = {};
    for (const block_id of blocks_ids) {
      const activeColoring = String(modelColorStyle.modelBlockActiveColoring(modelId, block_id));
      activeColoringGroups[activeColoring] ??= [];
      activeColoringGroups[activeColoring].push(block_id);
    }

    const coloringPromises: Promise<unknown>[] = [];

    for (const [type, type_blocks_ids] of Object.entries(activeColoringGroups)) {
      if (type === "constant") {
        const colorGroups: Record<string, ColorGroup> = {};
        for (const block_id of type_blocks_ids) {
          const color = modelColorStyle.modelBlockColor(modelId, block_id);
          const color_key = JSON.stringify(color);
          colorGroups[color_key] ??= { color, blocks_ids: [] };
          colorGroups[color_key].blocks_ids.push(block_id);
        }
        coloringPromises.push(
          ...Object.values(colorGroups).map(async ({ color, blocks_ids: ids }) => {
            const result = await modelColorStyle.setModelBlocksColor(
              modelId,
              ids,
              color,
              "constant",
            );
            return result;
          }),
        );
      } else if (type === "random") {
        coloringPromises.push(
          modelColorStyle.setModelBlocksColor(modelId, type_blocks_ids, undefined, "random"),
        );
      } else if (type === "vertex") {
        const vertexGroups: Record<string, AttributeGroup> = {};
        for (const block_id of type_blocks_ids) {
          const name = modelBlocksVertexAttribute.modelBlocksVertexAttributeName(modelId, block_id);
          const item = modelBlocksVertexAttribute.modelBlocksVertexAttributeItem(modelId, block_id);
          const [minimum, maximum] = modelBlocksVertexAttribute.modelBlocksVertexAttributeRange(
            modelId,
            block_id,
          );
          const colorMap = modelBlocksVertexAttribute.modelBlocksVertexAttributeColorMap(
            modelId,
            block_id,
          );
          const attribute = { name, item, minimum, maximum, colorMap };
          if (!isModelBlocksVertexAttributeValid(attribute)) {
            continue;
          }
          const key = `${name}_${item}_${colorMap}_${minimum}_${maximum}`;
          vertexGroups[key] ??= {
            name,
            item,
            minimum,
            maximum,
            colorMap,
            blocks_ids: [],
          };
          vertexGroups[key].blocks_ids.push(block_id);
        }
        coloringPromises.push(
          ...Object.values(vertexGroups).map(
            async ({ name, item, minimum, maximum, colorMap, blocks_ids: ids }) => {
              const result = await modelBlocksVertexAttribute.setModelBlocksVertexAttribute(
                modelId,
                ids,
                {
                  name,
                  item,
                  minimum,
                  maximum,
                  colorMap,
                },
              );
              return result;
            },
          ),
        );
      } else if (type === "polyhedron") {
        const polyhedronGroups: Record<string, AttributeGroup> = {};
        for (const block_id of type_blocks_ids) {
          const name = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeName(
            modelId,
            block_id,
          );
          const item = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeItem(
            modelId,
            block_id,
          );
          const [minimum, maximum] =
            modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeRange(modelId, block_id);
          const colorMap = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeColorMap(
            modelId,
            block_id,
          );
          const attribute = { name, item, minimum, maximum, colorMap };
          if (!isModelBlocksPolyhedronAttributeValid(attribute)) {
            continue;
          }
          const key = `${name}_${item}_${colorMap}_${minimum}_${maximum}`;
          polyhedronGroups[key] ??= {
            name,
            item,
            minimum,
            maximum,
            colorMap,
            blocks_ids: [],
          };
          polyhedronGroups[key].blocks_ids.push(block_id);
        }
        coloringPromises.push(
          ...Object.values(polyhedronGroups).map(
            async ({ name, item, minimum, maximum, colorMap, blocks_ids: ids }) => {
              const result = await modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttribute(
                modelId,
                ids,
                {
                  name,
                  item,
                  minimum,
                  maximum,
                  colorMap,
                },
              );
              return result;
            },
          ),
        );
      }
    }

    const result = await Promise.all(coloringPromises);
    return result;
  }

  async function applyModelBlocksStyle(modelId: string): Promise<void> {
    const blocks_ids = await dataStore.getBlocksGeodeIds(modelId);
    if (blocks_ids.length === 0) {
      return;
    }

    await Promise.all([
      applyModelBlocksVisibilityStyle(modelId, blocks_ids),
      applyModelBlocksColoringStyle(modelId, blocks_ids),
    ]);
  }

  return {
    applyModelBlocksStyle,
    setModelBlocksDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
    ...modelBlocksVertexAttribute,
    ...modelBlocksPolyhedronAttribute,
  };
}
