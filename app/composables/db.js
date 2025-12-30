import Dexie from "dexie"

export class ImportedDataDB extends Dexie {
  constructor() {
    super("ImportedDataDB")

    this.version(1).stores({
      importedData:
        "id, name, viewer_type, geode_object_type, visible, created_at",
    })
  }
}

export const db = new ImportedDataDB()
