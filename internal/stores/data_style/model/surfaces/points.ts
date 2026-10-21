import {
  type ModelComponentPointsStyle,
  useModelComponentPointsStyle,
} from "@ogw_internal/stores/data_style/model/points/component";

interface UseModelSurfacesPointsStyleReturn {
  modelSurfacePointsVisibility: ModelComponentPointsStyle["visibility"];
  modelSurfacePointsSize: ModelComponentPointsStyle["size"];
  modelSurfacePointsColor: ModelComponentPointsStyle["color"];
  modelSurfacePointsActiveColoring: ModelComponentPointsStyle["activeColoring"];
  modelSurfacePointsVertexAttributeName: ModelComponentPointsStyle["vertexAttributeName"];
  modelSurfacePointsVertexAttributeItem: ModelComponentPointsStyle["vertexAttributeItem"];
  modelSurfacePointsVertexAttributeRange: ModelComponentPointsStyle["vertexAttributeRange"];
  modelSurfacePointsVertexAttributeColorMap: ModelComponentPointsStyle["vertexAttributeColorMap"];
  modelSurfacePointsVertexAttributeNoDataColor: ModelComponentPointsStyle["vertexAttributeNoDataColor"];
  setModelSurfacesPointsVisibility: ModelComponentPointsStyle["setVisibility"];
  setModelSurfacesPointsSize: ModelComponentPointsStyle["setSize"];
  setModelSurfacesPointsColor: ModelComponentPointsStyle["setColor"];
  setModelSurfacesPointsActiveColoring: ModelComponentPointsStyle["setActiveColoring"];
  setModelSurfacesPointsVertexAttributeName: ModelComponentPointsStyle["setVertexAttributeName"];
  setModelSurfacesPointsVertexAttributeItem: ModelComponentPointsStyle["setVertexAttributeItem"];
  setModelSurfacesPointsVertexAttributeRange: ModelComponentPointsStyle["setVertexAttributeRange"];
  setModelSurfacesPointsVertexAttributeColorMap: ModelComponentPointsStyle["setVertexAttributeColorMap"];
  setModelSurfacesPointsVertexAttributeNoDataColor: ModelComponentPointsStyle["setVertexAttributeNoDataColor"];
  applyModelSurfacesPointsStyle: ModelComponentPointsStyle["applyPointsStyle"];
}

export function useModelSurfacesPointsStyle(): UseModelSurfacesPointsStyleReturn {
  const points = useModelComponentPointsStyle("Surface");
  return {
    modelSurfacePointsVisibility: points.visibility,
    modelSurfacePointsSize: points.size,
    modelSurfacePointsColor: points.color,
    modelSurfacePointsActiveColoring: points.activeColoring,
    modelSurfacePointsVertexAttributeName: points.vertexAttributeName,
    modelSurfacePointsVertexAttributeItem: points.vertexAttributeItem,
    modelSurfacePointsVertexAttributeRange: points.vertexAttributeRange,
    modelSurfacePointsVertexAttributeColorMap: points.vertexAttributeColorMap,
    modelSurfacePointsVertexAttributeNoDataColor: points.vertexAttributeNoDataColor,
    setModelSurfacesPointsVisibility: points.setVisibility,
    setModelSurfacesPointsSize: points.setSize,
    setModelSurfacesPointsColor: points.setColor,
    setModelSurfacesPointsActiveColoring: points.setActiveColoring,
    setModelSurfacesPointsVertexAttributeName: points.setVertexAttributeName,
    setModelSurfacesPointsVertexAttributeItem: points.setVertexAttributeItem,
    setModelSurfacesPointsVertexAttributeRange: points.setVertexAttributeRange,
    setModelSurfacesPointsVertexAttributeColorMap: points.setVertexAttributeColorMap,
    setModelSurfacesPointsVertexAttributeNoDataColor: points.setVertexAttributeNoDataColor,
    applyModelSurfacesPointsStyle: points.applyPointsStyle,
  };
}
