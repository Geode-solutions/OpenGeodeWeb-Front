import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";

interface ComponentNameEntry {
  getterKey: string;
  setterKey: string;
  key: string;
}

interface ActiveComponent extends ComponentNameEntry {
  activeColoring: string;
  attributeType: string;
  // Geode ids of the model components sharing this coloring, undefined for a mesh
  componentIds?: string[];
}

interface ModelComponent {
  type: string;
  geodeId: string;
}

const ATTRIBUTE_COLORINGS = new Set(["vertex", "edge", "polygon", "cell", "polyhedron"]);

function attributeTypeOf(activeColoring: string): string {
  return `${activeColoring.charAt(0).toUpperCase()}${activeColoring.slice(1)}Attribute`;
}

const MESH_COMPONENT_NAMES: ComponentNameEntry[] = [
  { getterKey: "meshPoints", setterKey: "MeshPoints", key: "points" },
  { getterKey: "meshEdges", setterKey: "MeshEdges", key: "edges" },
  { getterKey: "meshPolygons", setterKey: "MeshPolygons", key: "polygons" },
  { getterKey: "meshCells", setterKey: "MeshCells", key: "cells" },
  { getterKey: "meshPolyhedra", setterKey: "MeshPolyhedra", key: "polyhedra" },
];

interface MeshStyle {
  points?: Record<string, unknown>;
  edges?: Record<string, unknown>;
  polygons?: Record<string, unknown>;
  cells?: Record<string, unknown>;
  polyhedra?: Record<string, unknown>;
}

function isColoringValue(value: unknown): value is { active?: string } {
  return typeof value === "object" && value !== null;
}

function meshComponentStyle(style: MeshStyle, key: string): Record<string, unknown> | undefined {
  switch (key) {
    case "points": {
      return style.points;
    }
    case "edges": {
      return style.edges;
    }
    case "polygons": {
      return style.polygons;
    }
    case "cells": {
      return style.cells;
    }
    case "polyhedra": {
      return style.polyhedra;
    }
    default: {
      return undefined;
    }
  }
}

// The mesh element types colored by an attribute, from the mesh style
function meshActiveComponents(style: MeshStyle): ActiveComponent[] {
  const activeComponents: ActiveComponent[] = [];
  for (const { key, getterKey, setterKey } of MESH_COMPONENT_NAMES) {
    const coloring = meshComponentStyle(style, key)?.coloring;
    if (!isColoringValue(coloring)) {
      continue;
    }
    const { active: activeColoring } = coloring;
    if (activeColoring === undefined || !ATTRIBUTE_COLORINGS.has(activeColoring)) {
      continue;
    }
    const attributeType = attributeTypeOf(activeColoring);
    activeComponents.push({ activeColoring, attributeType, getterKey, setterKey, key });
  }
  return activeComponents;
}

// The *_attribute_names or *_attribute_range schema of the component coloring
function attributeSchema(comp: ActiveComponent, route: "names" | "range"): unknown {
  const prefix = comp.componentIds ? "model_component_" : "";
  return (back_schemas.opengeodeweb_back as Record<string, unknown>)[
    `${prefix}${comp.activeColoring}_attribute_${route}`
  ];
}

function attributeParams(
  targetId: string,
  comp: ActiveComponent,
): { id: string; component_ids?: string[] } {
  return comp.componentIds ? { id: targetId, component_ids: comp.componentIds } : { id: targetId };
}

export {
  ATTRIBUTE_COLORINGS,
  type ActiveComponent,
  type ComponentNameEntry,
  type ModelComponent,
  attributeParams,
  attributeSchema,
  attributeTypeOf,
  meshActiveComponents,
};
