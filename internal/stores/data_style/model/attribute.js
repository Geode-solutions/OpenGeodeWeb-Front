import { database } from "@ogw_internal/database/database.js";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap.js";
import merge from "lodash/merge";
import { useDataStore } from "@ogw_front/stores/data.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state.js";
import { useModelCommonStyle } from "./common.js";
import { useViewerStore } from "@ogw_front/stores/viewer.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const attributeNameSchema = viewer_schemas.opengeodeweb_viewer.model.blocks.attribute_name;
const attributeColorMapSchema = viewer_schemas.opengeodeweb_viewer.model.blocks.attribute_color_map;

export function useModelComponentAttributeStyle() {
  const viewerStore = useViewerStore();
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function getStyleByLevel(id_model, component_id, component_type) {
    if (component_id) {
      return dataStyleState.getComponentStyle(id_model, component_id);
    } else if (component_type) {
      return dataStyleState.getModelComponentTypeStyle(id_model, component_type);
    } else {
      return dataStyleState.getStyle(id_model);
    }
  }

  async function mutateStyleByLevel(id_model, component_id, component_type, values) {
    if (component_id) {
      await modelCommonStyle.mutateComponentStyle(id_model, component_id, values);
    } else if (component_type) {
      await modelCommonStyle.mutateModelComponentTypeStyle(id_model, component_type, values);
      const geode_ids = await dataStore.getMeshComponentGeodeIds(id_model, component_type);
      if (geode_ids?.length) {
        await modelCommonStyle.mutateComponentStyles(id_model, geode_ids, values);
      }
    } else {
      await dataStyleState.mutateStyle(id_model, values);
      const model_components = await database.model_components
        .where("id")
        .equals(id_model)
        .toArray();
      const geode_ids = model_components.map((comp) => comp.geode_id);
      if (geode_ids?.length) {
        await modelCommonStyle.mutateComponentStyles(id_model, geode_ids, values);
      }
    }
  }

  async function getViewerIdsByLevel(id_model, component_id, component_type) {
    if (component_id) {
      return await dataStore.getMeshComponentsViewerIds(id_model, [component_id]);
    } else if (component_type) {
      const geode_ids = await dataStore.getMeshComponentGeodeIds(id_model, component_type);
      return await dataStore.getMeshComponentsViewerIds(id_model, geode_ids);
    } else {
      return await dataStore.getAllModelComponentsViewerIds(id_model);
    }
  }

  async function getGeodeIdsByLevel(id_model, component_id, component_type) {
    if (component_id) {
      return [component_id];
    } else if (component_type) {
      return await dataStore.getMeshComponentGeodeIds(id_model, component_type);
    } else {
      const model_components = await database.model_components
        .where("id")
        .equals(id_model)
        .toArray();
      return model_components.map((comp) => comp.geode_id);
    }
  }

  function getComponentColorSchema(component_type) {
    if (component_type === "Block") {
      return viewer_schemas.opengeodeweb_viewer.model.blocks.color;
    } else if (component_type === "Surface") {
      return viewer_schemas.opengeodeweb_viewer.model.surfaces.color;
    } else if (component_type === "Line") {
      return viewer_schemas.opengeodeweb_viewer.model.lines.color;
    } else if (component_type === "Corner") {
      return viewer_schemas.opengeodeweb_viewer.model.corners.color;
    }
    return viewer_schemas.opengeodeweb_viewer.model.blocks.color;
  }

  function modelComponentAttribute(id_model, component_id, component_type) {
    const style = getStyleByLevel(id_model, component_id, component_type);
    return style.attribute || { name: undefined, storedConfigs: {} };
  }

  async function mutateModelComponentAttribute(id_model, component_id, component_type, values) {
    const attribute = modelComponentAttribute(id_model, component_id, component_type);
    merge(attribute, values);
    await mutateStyleByLevel(id_model, component_id, component_type, { attribute });
  }

  function modelComponentAttributeStoredConfig(id_model, component_id, component_type, name) {
    const attribute = modelComponentAttribute(id_model, component_id, component_type);
    const storedConfigs = attribute.storedConfigs || {};
    if (name in storedConfigs) {
      return storedConfigs[name];
    }
    const defaultConfig = {
      minimum: undefined,
      maximum: undefined,
      colorMap: undefined,
    };
    setModelComponentAttributeStoredConfig(
      id_model,
      component_id,
      component_type,
      name,
      defaultConfig,
    );
    return defaultConfig;
  }

  async function setModelComponentAttributeStoredConfig(
    id_model,
    component_id,
    component_type,
    name,
    config,
  ) {
    await mutateModelComponentAttribute(id_model, component_id, component_type, {
      storedConfigs: {
        [name]: config,
      },
    });
  }

  function modelComponentAttributeName(id_model, component_id, component_type) {
    return modelComponentAttribute(id_model, component_id, component_type).name;
  }

  async function setModelComponentAttributeName(
    id_model,
    component_id,
    component_type,
    name,
    field_type = "cells",
  ) {
    const viewer_ids = await getViewerIdsByLevel(id_model, component_id, component_type);
    if (!viewer_ids?.length) {
      return;
    }

    const mapped_field_type =
      field_type === "vertex" || field_type === "vertices" || field_type === "points"
        ? "points"
        : "cells";

    return viewerStore.request(
      attributeNameSchema,
      { id: id_model, block_ids: viewer_ids, name, field_type: mapped_field_type },
      {
        response_function: async () => {
          const updates = { name };
          const attribute = modelComponentAttribute(id_model, component_id, component_type);
          if (!(name in (attribute.storedConfigs || {}))) {
            updates.storedConfigs = {
              [name]: {
                minimum: undefined,
                maximum: undefined,
                colorMap: undefined,
              },
            };
          }
          await mutateModelComponentAttribute(id_model, component_id, component_type, updates);
        },
      },
    );
  }

  function modelComponentAttributeRange(id_model, component_id, component_type) {
    const name = modelComponentAttributeName(id_model, component_id, component_type);
    if (!name) {
      return [undefined, undefined];
    }
    const storedConfig = modelComponentAttributeStoredConfig(
      id_model,
      component_id,
      component_type,
      name,
    );
    const { minimum, maximum } = storedConfig;
    return [minimum, maximum];
  }

  async function setModelComponentAttributeRange(
    id_model,
    component_id,
    component_type,
    minimum,
    maximum,
  ) {
    const name = modelComponentAttributeName(id_model, component_id, component_type);
    if (!name) {
      return;
    }
    const colorMap = modelComponentAttributeColorMap(id_model, component_id, component_type);
    const points = getRGBPointsFromPreset(colorMap);
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      return viewerStore.request(
        attributeColorMapSchema,
        { id: id_model, points, minimum, maximum },
        {
          response_function: () =>
            setModelComponentAttributeStoredConfig(id_model, component_id, component_type, name, {
              minimum,
              maximum,
            }),
        },
      );
    }
    return await setModelComponentAttributeStoredConfig(
      id_model,
      component_id,
      component_type,
      name,
      { minimum, maximum },
    );
  }

  function modelComponentAttributeColorMap(id_model, component_id, component_type) {
    const name = modelComponentAttributeName(id_model, component_id, component_type);
    if (!name) {
      return undefined;
    }
    const storedConfig = modelComponentAttributeStoredConfig(
      id_model,
      component_id,
      component_type,
      name,
    );
    return storedConfig.colorMap;
  }

  async function setModelComponentAttributeColorMap(
    id_model,
    component_id,
    component_type,
    colorMap,
  ) {
    const name = modelComponentAttributeName(id_model, component_id, component_type);
    if (!name) {
      return;
    }
    const storedConfig = modelComponentAttributeStoredConfig(
      id_model,
      component_id,
      component_type,
      name,
    );
    const points = getRGBPointsFromPreset(colorMap);
    const { minimum, maximum } = storedConfig;
    if (points.length > 0 && minimum !== undefined && maximum !== undefined) {
      return viewerStore.request(
        attributeColorMapSchema,
        { id: id_model, points, minimum, maximum },
        {
          response_function: () =>
            setModelComponentAttributeStoredConfig(id_model, component_id, component_type, name, {
              colorMap,
            }),
        },
      );
    }
    return await setModelComponentAttributeStoredConfig(
      id_model,
      component_id,
      component_type,
      name,
      { colorMap },
    );
  }

  function modelComponentColoringStyleKey(id_model, component_id, component_type) {
    const style = getStyleByLevel(id_model, component_id, component_type);
    return style.coloring_style_key || "color";
  }

  async function setModelComponentColoringStyleKey(
    id_model,
    component_id,
    component_type,
    coloring_style_key,
  ) {
    await mutateStyleByLevel(id_model, component_id, component_type, { coloring_style_key });
    if (coloring_style_key === "color") {
      const color = modelComponentColor(id_model, component_id, component_type);
      await setModelComponentColor(id_model, component_id, component_type, color);
    } else {
      const attributeName = modelComponentAttributeName(id_model, component_id, component_type);
      if (attributeName) {
        await setModelComponentAttributeName(id_model, component_id, component_type, attributeName);
      }
    }
  }

  function modelComponentColor(id_model, component_id, component_type) {
    const style = getStyleByLevel(id_model, component_id, component_type);
    return style.color || { red: 255, green: 255, blue: 255, alpha: 1 };
  }

  async function setModelComponentColor(id_model, component_id, component_type, color) {
    await mutateStyleByLevel(id_model, component_id, component_type, { color });
    const component_ids = await getGeodeIdsByLevel(id_model, component_id, component_type);
    if (!component_ids?.length) {
      return;
    }
    const type =
      component_type ||
      (component_id ? await resolveComponentType(id_model, component_id) : undefined);
    const color_schema = getComponentColorSchema(type);
    await modelCommonStyle.setModelTypeColor(
      id_model,
      component_ids,
      color,
      color_schema,
      "constant",
    );
  }

  async function resolveComponentType(id_model, component_id) {
    const component = await database.model_components
      .where("[id+geode_id]")
      .equals([id_model, component_id])
      .first();
    return component ? component.type : undefined;
  }

  async function applyModelComponentAttributeStyle(id_model) {
    // This is called on model load to restore any saved attribute style
    // 1. Check global model coloring style key
    const modelStyle = dataStyleState.getStyle(id_model);
    if (modelStyle.coloring_style_key && modelStyle.coloring_style_key !== "color") {
      const name = modelComponentAttributeName(id_model, undefined, undefined);
      if (name) {
        await setModelComponentAttributeName(id_model, undefined, undefined, name);
        const [min, max] = modelComponentAttributeRange(id_model, undefined, undefined);
        if (min !== undefined && max !== undefined) {
          await setModelComponentAttributeRange(id_model, undefined, undefined, min, max);
        }
      }
    }

    // 2. Iterate component types
    const types = ["Block", "Surface", "Line", "Corner"];
    for (const compType of types) {
      const typeStyle = dataStyleState.getModelComponentTypeStyle(id_model, compType);
      if (typeStyle.coloring_style_key && typeStyle.coloring_style_key !== "color") {
        const name = modelComponentAttributeName(id_model, undefined, compType);
        if (name) {
          await setModelComponentAttributeName(id_model, undefined, compType, name);
          const [min, max] = modelComponentAttributeRange(id_model, undefined, compType);
          if (min !== undefined && max !== undefined) {
            await setModelComponentAttributeRange(id_model, undefined, compType, min, max);
          }
        }
      }
    }

    // 3. Iterate individual components
    const components = await database.model_component_datastyle
      .where("id_model")
      .equals(id_model)
      .toArray();
    for (const comp of components) {
      if (comp.coloring_style_key && comp.coloring_style_key !== "color") {
        const name = modelComponentAttributeName(id_model, comp.id_component, undefined);
        if (name) {
          await setModelComponentAttributeName(id_model, comp.id_component, undefined, name);
          const [min, max] = modelComponentAttributeRange(id_model, comp.id_component, undefined);
          if (min !== undefined && max !== undefined) {
            await setModelComponentAttributeRange(id_model, comp.id_component, undefined, min, max);
          }
        }
      }
    }
  }

  return {
    modelComponentAttribute,
    modelComponentAttributeStoredConfig,
    setModelComponentAttributeStoredConfig,
    modelComponentAttributeName,
    modelComponentAttributeRange,
    modelComponentAttributeColorMap,
    modelComponentColoringStyleKey,
    modelComponentColor,
    setModelComponentAttributeName,
    setModelComponentAttributeRange,
    setModelComponentAttributeColorMap,
    setModelComponentColoringStyleKey,
    setModelComponentColor,
    applyModelComponentAttributeStyle,
  };
}
