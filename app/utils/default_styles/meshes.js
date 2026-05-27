import {
  CELLS_DEFAULTCOLOR,
  CELLS_DEFAULTVISIBILITY,
  EDGES_DEFAULTCOLOR,
  EDGES_DEFAULTVISIBILITY,
  EDGES_DEFAULTWIDTH,
  POINTS_DEFAULTCOLOR,
  POINTS_DEFAULTSIZE,
  POINTS_DEFAULTVISIBILITY,
  POLYGONS_DEFAULTCOLOR,
  POLYGONS_DEFAULTVISIBILITY,
  POLYHEDRA_DEFAULTCOLOR,
  POLYHEDRA_DEFAULTVISIBILITY,
} from "./constants";

function meshPointsDefaultStyle(
  visibility = POINTS_DEFAULTVISIBILITY,
  size = POINTS_DEFAULTSIZE,
  color = POINTS_DEFAULTCOLOR,
) {
  return {
    visibility,
    coloring: {
      active: "color",
      color,
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
    },
    size,
  };
}

function meshEdgesDefaultStyle(
  visibility = EDGES_DEFAULTVISIBILITY,
  width = EDGES_DEFAULTWIDTH,
  color = EDGES_DEFAULTCOLOR,
) {
  return {
    visibility,
    coloring: {
      active: "color",
      color,
      edge: {
        name: undefined,
        storedConfigs: {},
      },
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
    },
    width,
  };
}

function meshCellsDefaultStyle(visibility = CELLS_DEFAULTVISIBILITY, color = CELLS_DEFAULTCOLOR) {
  return {
    visibility,
    coloring: {
      active: "color",
      cell: {
        name: undefined,
        storedConfigs: {},
      },
      color,
      textures: undefined,
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
    },
  };
}

function meshPolygonsDefaultStyle(
  visibility = POLYGONS_DEFAULTVISIBILITY,
  color = POLYGONS_DEFAULTCOLOR,
) {
  return {
    visibility,
    coloring: {
      active: "color",
      color,
      textures: undefined,
      polygon: {
        name: undefined,
        storedConfigs: {},
      },
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
    },
  };
}

function meshPolyhedraDefaultStyle(
  visibility = POLYHEDRA_DEFAULTVISIBILITY,
  color = POLYHEDRA_DEFAULTCOLOR,
) {
  return {
    visibility,
    coloring: {
      active: "color",
      color,
      polyhedron: {
        name: undefined,
        storedConfigs: {},
      },
      vertex: {
        name: undefined,
        storedConfigs: {},
      },
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
