import {
  type ModelComponentPointsStyle,
  useModelComponentPointsStyle,
} from "@ogw_internal/stores/data_style/model/points/component";

interface UseModelLinesPointsStyleReturn {
  modelLinePointsVisibility: ModelComponentPointsStyle["visibility"];
  modelLinePointsSize: ModelComponentPointsStyle["size"];
  modelLinePointsColor: ModelComponentPointsStyle["color"];
  modelLinePointsActiveColoring: ModelComponentPointsStyle["activeColoring"];
  modelLinePointsVertexAttributeName: ModelComponentPointsStyle["vertexAttributeName"];
  modelLinePointsVertexAttributeItem: ModelComponentPointsStyle["vertexAttributeItem"];
  modelLinePointsVertexAttributeRange: ModelComponentPointsStyle["vertexAttributeRange"];
  modelLinePointsVertexAttributeColorMap: ModelComponentPointsStyle["vertexAttributeColorMap"];
  modelLinePointsVertexAttributeNoDataColor: ModelComponentPointsStyle["vertexAttributeNoDataColor"];
  setModelLinesPointsVisibility: ModelComponentPointsStyle["setVisibility"];
  setModelLinesPointsSize: ModelComponentPointsStyle["setSize"];
  setModelLinesPointsColor: ModelComponentPointsStyle["setColor"];
  setModelLinesPointsActiveColoring: ModelComponentPointsStyle["setActiveColoring"];
  setModelLinesPointsVertexAttributeName: ModelComponentPointsStyle["setVertexAttributeName"];
  setModelLinesPointsVertexAttributeItem: ModelComponentPointsStyle["setVertexAttributeItem"];
  setModelLinesPointsVertexAttributeRange: ModelComponentPointsStyle["setVertexAttributeRange"];
  setModelLinesPointsVertexAttributeColorMap: ModelComponentPointsStyle["setVertexAttributeColorMap"];
  setModelLinesPointsVertexAttributeNoDataColor: ModelComponentPointsStyle["setVertexAttributeNoDataColor"];
  applyModelLinesPointsStyle: ModelComponentPointsStyle["applyPointsStyle"];
}

export function useModelLinesPointsStyle(): UseModelLinesPointsStyleReturn {
  const points = useModelComponentPointsStyle("Line");
  return {
    modelLinePointsVisibility: points.visibility,
    modelLinePointsSize: points.size,
    modelLinePointsColor: points.color,
    modelLinePointsActiveColoring: points.activeColoring,
    modelLinePointsVertexAttributeName: points.vertexAttributeName,
    modelLinePointsVertexAttributeItem: points.vertexAttributeItem,
    modelLinePointsVertexAttributeRange: points.vertexAttributeRange,
    modelLinePointsVertexAttributeColorMap: points.vertexAttributeColorMap,
    modelLinePointsVertexAttributeNoDataColor: points.vertexAttributeNoDataColor,
    setModelLinesPointsVisibility: points.setVisibility,
    setModelLinesPointsSize: points.setSize,
    setModelLinesPointsColor: points.setColor,
    setModelLinesPointsActiveColoring: points.setActiveColoring,
    setModelLinesPointsVertexAttributeName: points.setVertexAttributeName,
    setModelLinesPointsVertexAttributeItem: points.setVertexAttributeItem,
    setModelLinesPointsVertexAttributeRange: points.setVertexAttributeRange,
    setModelLinesPointsVertexAttributeColorMap: points.setVertexAttributeColorMap,
    setModelLinesPointsVertexAttributeNoDataColor: points.setVertexAttributeNoDataColor,
    applyModelLinesPointsStyle: points.applyPointsStyle,
  };
}
