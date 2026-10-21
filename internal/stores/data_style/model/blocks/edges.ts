import {
  type ModelComponentEdgesStyle,
  useModelComponentEdgesStyle,
} from "@ogw_internal/stores/data_style/model/edges/component";

interface UseModelBlocksEdgesStyleReturn {
  modelBlockEdgesVisibility: ModelComponentEdgesStyle["visibility"];
  modelBlockEdgesWidth: ModelComponentEdgesStyle["width"];
  modelBlockEdgesColor: ModelComponentEdgesStyle["color"];
  modelBlockEdgesActiveColoring: ModelComponentEdgesStyle["activeColoring"];
  modelBlockEdgesVertexAttributeName: ModelComponentEdgesStyle["vertexAttributeName"];
  modelBlockEdgesVertexAttributeItem: ModelComponentEdgesStyle["vertexAttributeItem"];
  modelBlockEdgesVertexAttributeRange: ModelComponentEdgesStyle["vertexAttributeRange"];
  modelBlockEdgesVertexAttributeColorMap: ModelComponentEdgesStyle["vertexAttributeColorMap"];
  modelBlockEdgesVertexAttributeNoDataColor: ModelComponentEdgesStyle["vertexAttributeNoDataColor"];
  setModelBlocksEdgesVisibility: ModelComponentEdgesStyle["setVisibility"];
  setModelBlocksEdgesWidth: ModelComponentEdgesStyle["setWidth"];
  setModelBlocksEdgesColor: ModelComponentEdgesStyle["setColor"];
  setModelBlocksEdgesActiveColoring: ModelComponentEdgesStyle["setActiveColoring"];
  setModelBlocksEdgesVertexAttributeName: ModelComponentEdgesStyle["setVertexAttributeName"];
  setModelBlocksEdgesVertexAttributeItem: ModelComponentEdgesStyle["setVertexAttributeItem"];
  setModelBlocksEdgesVertexAttributeRange: ModelComponentEdgesStyle["setVertexAttributeRange"];
  setModelBlocksEdgesVertexAttributeColorMap: ModelComponentEdgesStyle["setVertexAttributeColorMap"];
  setModelBlocksEdgesVertexAttributeNoDataColor: ModelComponentEdgesStyle["setVertexAttributeNoDataColor"];
  applyModelBlocksEdgesStyle: ModelComponentEdgesStyle["applyEdgesStyle"];
}

export function useModelBlocksEdgesStyle(): UseModelBlocksEdgesStyleReturn {
  const edges = useModelComponentEdgesStyle("Block");
  return {
    modelBlockEdgesVisibility: edges.visibility,
    modelBlockEdgesWidth: edges.width,
    modelBlockEdgesColor: edges.color,
    modelBlockEdgesActiveColoring: edges.activeColoring,
    modelBlockEdgesVertexAttributeName: edges.vertexAttributeName,
    modelBlockEdgesVertexAttributeItem: edges.vertexAttributeItem,
    modelBlockEdgesVertexAttributeRange: edges.vertexAttributeRange,
    modelBlockEdgesVertexAttributeColorMap: edges.vertexAttributeColorMap,
    modelBlockEdgesVertexAttributeNoDataColor: edges.vertexAttributeNoDataColor,
    setModelBlocksEdgesVisibility: edges.setVisibility,
    setModelBlocksEdgesWidth: edges.setWidth,
    setModelBlocksEdgesColor: edges.setColor,
    setModelBlocksEdgesActiveColoring: edges.setActiveColoring,
    setModelBlocksEdgesVertexAttributeName: edges.setVertexAttributeName,
    setModelBlocksEdgesVertexAttributeItem: edges.setVertexAttributeItem,
    setModelBlocksEdgesVertexAttributeRange: edges.setVertexAttributeRange,
    setModelBlocksEdgesVertexAttributeColorMap: edges.setVertexAttributeColorMap,
    setModelBlocksEdgesVertexAttributeNoDataColor: edges.setVertexAttributeNoDataColor,
    applyModelBlocksEdgesStyle: edges.applyEdgesStyle,
  };
}
