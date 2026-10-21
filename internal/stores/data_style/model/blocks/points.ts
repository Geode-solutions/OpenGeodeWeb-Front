import {
  type ModelComponentPointsStyle,
  useModelComponentPointsStyle,
} from "@ogw_internal/stores/data_style/model/points/component";

interface UseModelBlocksPointsStyleReturn {
  modelBlockPointsVisibility: ModelComponentPointsStyle["visibility"];
  modelBlockPointsSize: ModelComponentPointsStyle["size"];
  modelBlockPointsColor: ModelComponentPointsStyle["color"];
  modelBlockPointsActiveColoring: ModelComponentPointsStyle["activeColoring"];
  modelBlockPointsVertexAttributeName: ModelComponentPointsStyle["vertexAttributeName"];
  modelBlockPointsVertexAttributeItem: ModelComponentPointsStyle["vertexAttributeItem"];
  modelBlockPointsVertexAttributeRange: ModelComponentPointsStyle["vertexAttributeRange"];
  modelBlockPointsVertexAttributeColorMap: ModelComponentPointsStyle["vertexAttributeColorMap"];
  modelBlockPointsVertexAttributeNoDataColor: ModelComponentPointsStyle["vertexAttributeNoDataColor"];
  setModelBlocksPointsVisibility: ModelComponentPointsStyle["setVisibility"];
  setModelBlocksPointsSize: ModelComponentPointsStyle["setSize"];
  setModelBlocksPointsColor: ModelComponentPointsStyle["setColor"];
  setModelBlocksPointsActiveColoring: ModelComponentPointsStyle["setActiveColoring"];
  setModelBlocksPointsVertexAttributeName: ModelComponentPointsStyle["setVertexAttributeName"];
  setModelBlocksPointsVertexAttributeItem: ModelComponentPointsStyle["setVertexAttributeItem"];
  setModelBlocksPointsVertexAttributeRange: ModelComponentPointsStyle["setVertexAttributeRange"];
  setModelBlocksPointsVertexAttributeColorMap: ModelComponentPointsStyle["setVertexAttributeColorMap"];
  setModelBlocksPointsVertexAttributeNoDataColor: ModelComponentPointsStyle["setVertexAttributeNoDataColor"];
  applyModelBlocksPointsStyle: ModelComponentPointsStyle["applyPointsStyle"];
}

export function useModelBlocksPointsStyle(): UseModelBlocksPointsStyleReturn {
  const points = useModelComponentPointsStyle("Block");
  return {
    modelBlockPointsVisibility: points.visibility,
    modelBlockPointsSize: points.size,
    modelBlockPointsColor: points.color,
    modelBlockPointsActiveColoring: points.activeColoring,
    modelBlockPointsVertexAttributeName: points.vertexAttributeName,
    modelBlockPointsVertexAttributeItem: points.vertexAttributeItem,
    modelBlockPointsVertexAttributeRange: points.vertexAttributeRange,
    modelBlockPointsVertexAttributeColorMap: points.vertexAttributeColorMap,
    modelBlockPointsVertexAttributeNoDataColor: points.vertexAttributeNoDataColor,
    setModelBlocksPointsVisibility: points.setVisibility,
    setModelBlocksPointsSize: points.setSize,
    setModelBlocksPointsColor: points.setColor,
    setModelBlocksPointsActiveColoring: points.setActiveColoring,
    setModelBlocksPointsVertexAttributeName: points.setVertexAttributeName,
    setModelBlocksPointsVertexAttributeItem: points.setVertexAttributeItem,
    setModelBlocksPointsVertexAttributeRange: points.setVertexAttributeRange,
    setModelBlocksPointsVertexAttributeColorMap: points.setVertexAttributeColorMap,
    setModelBlocksPointsVertexAttributeNoDataColor: points.setVertexAttributeNoDataColor,
    applyModelBlocksPointsStyle: points.applyPointsStyle,
  };
}
