import { Dexie } from "dexie"
import { dataTable } from "./tables/data_table"
import { modelComponentsTable } from "./tables/model_components"
import { modelComponentsRelationTable } from "./tables/model_components_relation"


export class ExtendedDatabase extends Dexie {
  constructor(currentVersion, currentStores, newTables) {
    super("Database")

    for (let version = 1; version <= currentVersion; version += 1) {
      if (version === 1) {
        this.version(1).stores({
          [dataTable.name]: dataTable.schema,
          [modelComponentsTable.name]: modelComponentsTable.schema,
          [modelComponentsRelationTable.name]:
            modelComponentsRelationTable.schema,
        })


      } else {
        this.version(version).stores(currentStores)
      }
    }

    this.version(currentVersion + 1).stores({
      ...currentStores,
      ...newTables,
    })
  }
}
