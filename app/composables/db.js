import Dexie from "dexie"

export class ImportedDataDB extends Dexie {
  constructor() {
    super("ImportedDataDB")

    this.version(1).stores({
      importedData:
        "id, name, viewer_type, geode_object_type, visible, created_at",
    })

    this.version(2).stores({
      importedData:
        "id, name, viewer_type, geode_object_type, visible, created_at, folder_id, *tags",
      folders: "++id, name, parent_id, created_at",
    })

    this.version(3).stores({
      importedData:
        "id, name, viewer_type, geode_object_type, visible, created_at, folder_id, *tags, pinned",
      folders: "++id, name, parent_id, created_at",
    })

    this.version(4).stores({
      importedData:
        "id, name, viewer_type, geode_object_type, visible, created_at",
      folders: null,
    })
  }
}

export const db = new ImportedDataDB()
