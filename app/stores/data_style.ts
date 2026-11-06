import { type LegacyDataId, fromLegacyDataId } from "@ogw_front/utils/legacy_data_id";
import type {
  ModelComponentStyle,
  ModelComponentTypeStyle,
  ObjectStyle,
} from "@ogw_internal/stores/data_style/types";
import type { DataId } from "@ogw_front/types/identifiers";
import type { Table } from "dexie";
import { database } from "@ogw_internal/database/database.js";
import { getDefaultStyle } from "@ogw_front/utils/default_styles";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useMeshStyle } from "@ogw_internal/stores/data_style/mesh/index";
import { useModelStyle } from "@ogw_internal/stores/data_style/model/index";

interface DataStyleSnapshot {
  // Projects saved before data_id existed hold their styles with an `id`
  readonly styles: Record<string, LegacyDataId<ObjectStyle> | ObjectStyle>;
  readonly componentStyles: Record<string, ModelComponentStyle>;
  readonly modelComponentTypeStyles: Record<string, ModelComponentTypeStyle>;
}

// The database's table map is dynamically assembled at runtime (see internal/database/database.ts), so its exported type is a loose `{}`; cast it to the shape it actually has at runtime rather than widening every call site.
type DatabaseTables = Record<string, Table<Record<string, unknown>, string> | undefined>;

// `noUncheckedIndexedAccess` sees these as possibly undefined even though they're always registered before this store is used; guard defensively rather than asserting.
function requireTable<TableValue>(table: TableValue | undefined, name: string): TableValue {
  if (table === undefined) {
    throw new Error(`Database table not initialized: ${name}`);
  }
  return table;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// oxlint-disable-next-line max-lines-per-function
export const useDataStyleStore = defineStore("dataStyle", () => {
  const dataStyleState = useDataStyleState();
  const meshStyleStore = useMeshStyle();
  const modelStyleStore = useModelStyle();
  const attributeTimeStepStyle = useAttributeTimeStepStyle();
  const dataStore = useDataStore();
  // oxlint-disable-next-line no-unsafe-type-assertion -- the database Proxy is typed as `{}` at its export site; this cast documents its real runtime shape.
  const typedDatabase = database as unknown as DatabaseTables;
  const data_style_db = requireTable(typedDatabase.data_style, "data_style");
  const model_component_type_datastyle_db = requireTable(
    typedDatabase.model_component_type_datastyle,
    "model_component_type_datastyle",
  );
  const component_datastyle_db = requireTable(
    typedDatabase.model_component_datastyle,
    "model_component_datastyle",
  );

  async function addDataStyle(dataId: DataId, geode_object: string): Promise<void> {
    const defaultStyle = getDefaultStyle(geode_object);
    await data_style_db.put(
      structuredClone({ data_id: dataId, ...(isRecord(defaultStyle) ? defaultStyle : {}) }),
    );
  }

  async function setVisibility(dataId: DataId, visibility: boolean): Promise<unknown> {
    const item = await dataStore.item(dataId);
    if (!(await dataStore.isItemViewable(item))) {
      return dataStyleState.mutateStyle(dataId, { visibility });
    }

    const { viewer_type } = item;

    if (viewer_type === "mesh") {
      return meshStyleStore.setMeshVisibility(dataId, visibility);
    }
    if (viewer_type === "model") {
      return modelStyleStore.setModelVisibility(dataId, visibility);
    }
    throw new Error("Unknown viewer_type");
  }

  async function applyDefaultStyle(dataId: DataId): Promise<unknown[]> {
    const item = await dataStore.item(dataId);
    if (!(await dataStore.isItemViewable(item))) {
      throw new Error(`applyDefaultStyle called for non-viewable item: ${dataId}`);
    }

    const { viewer_type } = item;

    if (viewer_type === "mesh") {
      return meshStyleStore.applyMeshStyle(dataId);
    }
    if (viewer_type === "model") {
      return modelStyleStore.applyModelStyle(dataId);
    }
    throw new Error(`Unknown viewer_type: ${viewer_type}`);
  }

  function exportStores(): DataStyleSnapshot {
    return {
      styles: dataStyleState.styles.value,
      componentStyles: dataStyleState.componentStyles.value,
      modelComponentTypeStyles: dataStyleState.modelComponentTypeStyles.value,
    };
  }

  // oxlint-disable-next-line prefer-readonly-parameter-types -- ObjectStyle (external type) has a mutable index signature and mutable nested StyleValues fields that can't be marked readonly from here.
  async function importStores(snapshot: DataStyleSnapshot): Promise<void> {
    const stylesSnapshot = snapshot.styles;
    const componentStylesSnapshot = snapshot.componentStyles;
    const modelComponentTypeStylesSnapshot = snapshot.modelComponentTypeStyles;

    await dataStyleState.clear();

    const style_promises = Object.entries(stylesSnapshot).map(
      // oxlint-disable-next-line prefer-readonly-parameter-types -- same external ObjectStyle limitation as above.
      async ([dataId, style]: readonly [string, LegacyDataId<ObjectStyle> | ObjectStyle]) => {
        const key = await data_style_db.put(
          structuredClone({ ...fromLegacyDataId<ObjectStyle>(style), data_id: dataId }),
        );
        return key;
      },
    );
    const component_style_promises = Object.values(componentStylesSnapshot).map(
      async (style: ModelComponentStyle) => {
        const key = await component_datastyle_db.put(structuredClone(style));
        return key;
      },
    );
    const model_component_type_style_promises = Object.values(modelComponentTypeStylesSnapshot).map(
      async (style: ModelComponentTypeStyle) => {
        const key = await model_component_type_datastyle_db.put(structuredClone(style));
        return key;
      },
    );

    await Promise.all([
      ...style_promises,
      ...component_style_promises,
      ...model_component_type_style_promises,
    ]);
    await dataStyleState.loadFromDatabase();
  }

  async function applyAllStylesFromState(): Promise<void> {
    const ids = Object.keys(dataStyleState.styles.value);
    const promises = ids.map(async (dataId) => {
      const meta = await dataStore.item(dataId);
      if (!(await dataStore.isItemViewable(meta))) {
        return;
      }
      const viewerType = meta.viewer_type;
      if (viewerType === "mesh") {
        await meshStyleStore.applyMeshStyle(dataId);
      } else if (viewerType === "model") {
        await modelStyleStore.applyModelStyle(dataId);
      }
    });
    await Promise.all(promises);
  }

  return {
    addDataStyle,
    applyDefaultStyle,
    setVisibility,
    exportStores,
    importStores,
    applyAllStylesFromState,
    ...dataStyleState,
    ...attributeTimeStepStyle,
    ...meshStyleStore,
    ...modelStyleStore,
  };
});

export type { DataStyleSnapshot };
