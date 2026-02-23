import { Dexie } from "dexie"
import { ExtendedDatabase } from "./extended_database"
import { dataTable } from "./tables/data_table"
import { modelComponentsTable } from "./tables/model_components"

class Database extends Dexie {
  constructor() {
    super("Database")

    this.version(1).stores({
      [dataTable.name]: dataTable.schema,
      [modelComponentsTable.name]: modelComponentsTable.schema,
    })
  }

  static async addTable(tableName, schemaDefinition) {
    const tempDb = new Database()
    await tempDb.open()

    if (tempDb.tables.some((table) => table.name === tableName)) {
      tempDb.close()
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

    return newDb
  }
}

const database = new Database()

export { Database, database }