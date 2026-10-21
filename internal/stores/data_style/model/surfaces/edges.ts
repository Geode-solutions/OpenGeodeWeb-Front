import {
  type ModelComponentEdgesStyle,
  useModelComponentEdgesStyle,
} from "@ogw_internal/stores/data_style/model/edges/component";

interface UseModelSurfacesEdgesStyleReturn {
  modelSurfaceEdgesVisibility: ModelComponentEdgesStyle["visibility"];
  modelSurfaceEdgesWidth: ModelComponentEdgesStyle["width"];
  modelSurfaceEdgesColor: ModelComponentEdgesStyle["color"];
  modelSurfaceEdgesActiveColoring: ModelComponentEdgesStyle["activeColoring"];
  modelSurfaceEdgesVertexAttributeName: ModelComponentEdgesStyle["vertexAttributeName"];
  modelSurfaceEdgesVertexAttributeItem: ModelComponentEdgesStyle["vertexAttributeItem"];
  modelSurfaceEdgesVertexAttributeRange: ModelComponentEdgesStyle["vertexAttributeRange"];
  modelSurfaceEdgesVertexAttributeColorMap: ModelComponentEdgesStyle["vertexAttributeColorMap"];
  modelSurfaceEdgesVertexAttributeNoDataColor: ModelComponentEdgesStyle["vertexAttributeNoDataColor"];
  setModelSurfacesEdgesVisibility: ModelComponentEdgesStyle["setVisibility"];
  setModelSurfacesEdgesWidth: ModelComponentEdgesStyle["setWidth"];
  setModelSurfacesEdgesColor: ModelComponentEdgesStyle["setColor"];
  setModelSurfacesEdgesActiveColoring: ModelComponentEdgesStyle["setActiveColoring"];
  setModelSurfacesEdgesVertexAttributeName: ModelComponentEdgesStyle["setVertexAttributeName"];
  setModelSurfacesEdgesVertexAttributeItem: ModelComponentEdgesStyle["setVertexAttributeItem"];
  setModelSurfacesEdgesVertexAttributeRange: ModelComponentEdgesStyle["setVertexAttributeRange"];
  setModelSurfacesEdgesVertexAttributeColorMap: ModelComponentEdgesStyle["setVertexAttributeColorMap"];
  setModelSurfacesEdgesVertexAttributeNoDataColor: ModelComponentEdgesStyle["setVertexAttributeNoDataColor"];
  applyModelSurfacesEdgesStyle: ModelComponentEdgesStyle["applyEdgesStyle"];
}

export function useModelSurfacesEdgesStyle(): UseModelSurfacesEdgesStyleReturn {
  const edges = useModelComponentEdgesStyle("Surface");
  return {
    modelSurfaceEdgesVisibility: edges.visibility,
    modelSurfaceEdgesWidth: edges.width,
    modelSurfaceEdgesColor: edges.color,
    modelSurfaceEdgesActiveColoring: edges.activeColoring,
    modelSurfaceEdgesVertexAttributeName: edges.vertexAttributeName,
    modelSurfaceEdgesVertexAttributeItem: edges.vertexAttributeItem,
    modelSurfaceEdgesVertexAttributeRange: edges.vertexAttributeRange,
    modelSurfaceEdgesVertexAttributeColorMap: edges.vertexAttributeColorMap,
    modelSurfaceEdgesVertexAttributeNoDataColor: edges.vertexAttributeNoDataColor,
    setModelSurfacesEdgesVisibility: edges.setVisibility,
    setModelSurfacesEdgesWidth: edges.setWidth,
    setModelSurfacesEdgesColor: edges.setColor,
    setModelSurfacesEdgesActiveColoring: edges.setActiveColoring,
    setModelSurfacesEdgesVertexAttributeName: edges.setVertexAttributeName,
    setModelSurfacesEdgesVertexAttributeItem: edges.setVertexAttributeItem,
    setModelSurfacesEdgesVertexAttributeRange: edges.setVertexAttributeRange,
    setModelSurfacesEdgesVertexAttributeColorMap: edges.setVertexAttributeColorMap,
    setModelSurfacesEdgesVertexAttributeNoDataColor: edges.setVertexAttributeNoDataColor,
    applyModelSurfacesEdgesStyle: edges.applyEdgesStyle,
  };
}
