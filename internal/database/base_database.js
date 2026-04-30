import { cameraPositionsTable } from "./tables/camera_positions";
import { dataStyleTable } from "./tables/data_style";
import { dataTable } from "./tables/data";
import { Dexie } from "dexie";
import { modelComponentsRelationTable } from "./tables/model_components_relation";
import { modelComponentsTable } from "./tables/model_components";
import { modelComponentDataStyleTable } from "./tables/model_component_datastyle";
import { modelComponentTypeDataStyleTable } from "./tables/model_component_type_datastyle";

export class BaseDatabase extends Dexie {
  static get initialStores() {
    return {
      [dataTable.name]: dataTable.schema,
      [modelComponentsTable.name]: modelComponentsTable.schema,
      [dataStyleTable.name]: dataStyleTable.schema,
      [modelComponentDataStyleTable.name]: modelComponentDataStyleTable.schema,
      [modelComponentTypeDataStyleTable.name]: modelComponentTypeDataStyleTable.schema,
      [modelComponentsRelationTable.name]: modelComponentsRelationTable.schema,
      [cameraPositionsTable.name]: cameraPositionsTable.schema,
      treeview_config: "id",
    };
  }

  clear() {
    return Promise.all(this.tables.map((table) => table.clear()));
  }
}
