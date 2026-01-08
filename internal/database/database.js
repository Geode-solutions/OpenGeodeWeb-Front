import Dexie from "dexie"
import { dataTable } from "./tables/data_table.js"

export class Database extends Dexie {
  constructor() {
    super("Database")

    this.version(1).stores({
      [dataTable.name]: dataTable.schema,
    })
  }

  static async addTable(tableName, schemaDefinition) {
    const tempDb = new Database()
    await tempDb.open()

    if (tempDb.tables.some((t) => t.name === tableName)) {
      console.warn(`Table "${tableName}" existe déjà`)
      tempDb.close()
      return tempDb
    }

    const currentVersion = tempDb.verno

    const currentStores = {}
    tempDb.tables.forEach((table) => {
      const keyPath = table.schema.primKey.src
      const indexes = table.schema.indexes.map((idx) => idx.src)
      currentStores[table.name] = [keyPath, ...indexes].join(",")
    })

    tempDb.close()

    class ExtendedDatabase extends Dexie {
      constructor() {
        super("Database")

        for (let v = 1; v <= currentVersion; v++) {
          if (v === 1) {
            this.version(1).stores({
              [dataTable.name]: dataTable.schema,
            })
          } else {
            this.version(v).stores(currentStores)
          }
        }

        this.version(currentVersion + 1).stores({
          ...currentStores,
          [tableName]: schemaDefinition,
        })
      }
    }

    const newDb = new ExtendedDatabase()
    await newDb.open()

    return newDb
  }
}

export const database = new Database()
