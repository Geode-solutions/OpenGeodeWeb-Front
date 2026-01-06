import Dexie from "dexie"
import { dataTable } from "./tables/data_table.js"

export async function addTableDynamically(tableName, schemaDefinition) {
    const tempDb = new Dexie("Database")
    await tempDb.open()

    if (tempDb.tables.some((t) => t.name === tableName)) {
        const existingTable = tempDb.table(tableName)
        tempDb.close()
        return existingTable
    }

    const currentVersion = tempDb.verno

    const currentStores = {}
    tempDb.tables.forEach((table) => {
        const keyPath = table.schema.primKey.src
        const indexes = table.schema.indexes.map((idx) => idx.src)
        currentStores[table.name] = [keyPath, ...indexes].join(",")
    })

    tempDb.close()

    const newDb = new Dexie("Database")

    for (let v = 1; v <= currentVersion; v++) {
        if (v === 1) {
            newDb.version(1).stores({
                [dataTable.name]: dataTable.schema,
            })
        } else {
            newDb.version(v).stores(currentStores)
        }
    }

    newDb.version(currentVersion + 1).stores({
        ...currentStores,
        [tableName]: schemaDefinition,
    })

    await newDb.open()

    const newTable = newDb.table(tableName)

    return newTable
}
