import { Dexie } from "dexie"
import { shallowRef } from "vue"
import { ExtendedDatabase } from "./extended_database"
import { dataTable } from "./tables/data_table"
import { modelComponentsTable } from "./tables/model_components"

class Database extends Dexie {
  constructor() {
    super("Database")

    this.version(2).stores({
      [dataTable.name]: dataTable.schema,
      [modelComponentsTable.name]: modelComponentsTable.schema,
    })
  }

  static async asyncAddTable(tableName, schemaDefinition) {
    const tempDb = databaseRef.value

    if (!tempDb.isOpen()) {
      await tempDb.open()
    }

    if (tempDb.tables.some((table) => table.name === tableName)) {
      return tempDb
    }

    const currentVersion = tempDb.verno
    const currentStores = {}

    for (const table of tempDb.tables) {
      const keyPath = table.schema.primKey.src
      const indexes = table.schema.indexes.map((index) => index.src)
      currentStores[table.name] = [keyPath, ...indexes].join(",")
    }

    tempDb.close()

    const newDb = new ExtendedDatabase(
      currentVersion,
      currentStores,
      tableName,
      schemaDefinition,
    )
    await newDb.open()

    databaseRef.value = newDb
    return newDb
  }

  static addTable(tableName, schemaDefinition) {
    return Database.asyncAddTable(tableName, schemaDefinition)
  }
}

const databaseInstance = new Database()
export const databaseRef = shallowRef(databaseInstance)

export { Database }
