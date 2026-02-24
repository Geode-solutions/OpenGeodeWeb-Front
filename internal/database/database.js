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
    await this.addTables({ [tableName]: schemaDefinition })
  }

  static async addTables(newTables) {
    const tempDb = new Dexie("Database")
    await tempDb.open()

    const currentVersion = tempDb.verno
    const currentStores = {}

    currentStores[dataTable.name] = dataTable.schema
    currentStores[modelComponentsTable.name] = modelComponentsTable.schema

    for (const table of tempDb.tables) {
      const keyPath = table.schema.primKey.src
      const indexes = table.schema.indexes.map((index) => index.src)
      const parts = keyPath ? [keyPath, ...indexes] : indexes
      currentStores[table.name] = parts.join(",")
    }

    tempDb.close()

    const allExisting = Object.keys(newTables).every(
      (tableName) => currentStores[tableName],
    )

    database.close()

    if (allExisting) {
      const existingDb = new Dexie("Database")
      for (let version = 1; version <= currentVersion; version += 1) {
        if (version === 1) {
          existingDb.version(1).stores({
            [dataTable.name]: dataTable.schema,
            [modelComponentsTable.name]: modelComponentsTable.schema,
          })
        } else {
          existingDb.version(version).stores(currentStores)
        }
      }
      await existingDb.open()
      database = existingDb
    } else {
      const newDb = new ExtendedDatabase(
        currentVersion,
        currentStores,
        newTables,
      )
      await newDb.open()
      database = newDb
    }
  }
}

let database = new Database()

export { Database, database }
