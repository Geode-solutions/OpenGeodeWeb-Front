import {
  type AttributeConfig,
  CELLS_DEFAULT_COLOR,
  CELLS_DEFAULT_VISIBILITY,
  EDGES_DEFAULT_COLOR,
  EDGES_DEFAULT_VISIBILITY,
  EDGES_DEFAULT_WIDTH,
  MESH_DEFAULT_ACTIVE_COLORING,
  POINTS_DEFAULT_COLOR,
  POINTS_DEFAULT_SIZE,
  POINTS_DEFAULT_VISIBILITY,
  POLYGONS_DEFAULT_COLOR,
  POLYGONS_DEFAULT_VISIBILITY,
  POLYHEDRA_DEFAULT_COLOR,
  POLYHEDRA_DEFAULT_VISIBILITY,
  type RGBAColor,
} from "./constants";
import type { MeshApplyTexturesParams } from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

function emptyAttributeConfig(): AttributeConfig {
  return { name: undefined, storedConfigs: {} };
}

interface MeshComponentColoring {
  active: string;
  constant: RGBAColor;
  vertex: AttributeConfig;
}

interface MeshEdgesColoring extends MeshComponentColoring {
  edge: AttributeConfig;
}

interface MeshCellsColoring extends MeshComponentColoring {
  cell: AttributeConfig;
  textures: MeshApplyTexturesParams["textures"];
}

interface MeshPolygonsColoring extends MeshComponentColoring {
  textures: MeshApplyTexturesParams["textures"];
  polygon: AttributeConfig;
}

interface MeshPolyhedraColoring extends MeshComponentColoring {
  polyhedron: AttributeConfig;
}

interface MeshPointsStyle {
  visibility: boolean;
  coloring: MeshComponentColoring;
  size: number;
}

interface MeshEdgesStyle {
  visibility: boolean;
  coloring: MeshEdgesColoring;
  width: number;
}

interface MeshCellsStyle {
  visibility: boolean;
  coloring: MeshCellsColoring;
}

interface MeshPolygonsStyle {
  visibility: boolean;
  coloring: MeshPolygonsColoring;
}

interface MeshPolyhedraStyle {
  visibility: boolean;
  coloring: MeshPolyhedraColoring;
}

function meshPointsDefaultStyle(
  visibility: boolean = POINTS_DEFAULT_VISIBILITY,
  size: number = POINTS_DEFAULT_SIZE,
  constant: RGBAColor = POINTS_DEFAULT_COLOR,
): MeshPointsStyle {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      constant,
      vertex: emptyAttributeConfig(),
    },
    size,
  };
}

function meshEdgesDefaultStyle(
  visibility: boolean = EDGES_DEFAULT_VISIBILITY,
  width: number = EDGES_DEFAULT_WIDTH,
  constant: RGBAColor = EDGES_DEFAULT_COLOR,
): MeshEdgesStyle {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      constant,
      edge: emptyAttributeConfig(),
      vertex: emptyAttributeConfig(),
    },
    width,
  };
}

function meshCellsDefaultStyle(
  visibility: boolean = CELLS_DEFAULT_VISIBILITY,
  constant: RGBAColor = CELLS_DEFAULT_COLOR,
): MeshCellsStyle {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      cell: emptyAttributeConfig(),
      constant,
      textures: [],
      vertex: emptyAttributeConfig(),
    },
  };
}

function meshPolygonsDefaultStyle(
  visibility: boolean = POLYGONS_DEFAULT_VISIBILITY,
  constant: RGBAColor = POLYGONS_DEFAULT_COLOR,
): MeshPolygonsStyle {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      constant,
      textures: [],
      polygon: emptyAttributeConfig(),
      vertex: emptyAttributeConfig(),
    },
  };
}

function meshPolyhedraDefaultStyle(
  visibility: boolean = POLYHEDRA_DEFAULT_VISIBILITY,
  constant: RGBAColor = POLYHEDRA_DEFAULT_COLOR,
): MeshPolyhedraStyle {
  return {
    visibility,
    coloring: {
      active: MESH_DEFAULT_ACTIVE_COLORING,
      constant,
      polyhedron: emptyAttributeConfig(),
      vertex: emptyAttributeConfig(),
    },
  };
}

export {
  meshPointsDefaultStyle,
  meshEdgesDefaultStyle,
  meshCellsDefaultStyle,
  meshPolygonsDefaultStyle,
  meshPolyhedraDefaultStyle,
};
export type {
  MeshCellsStyle,
  MeshEdgesStyle,
  MeshPointsStyle,
  MeshPolygonsStyle,
  MeshPolyhedraStyle,
};
