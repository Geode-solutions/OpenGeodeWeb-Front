import Dexie from "dexie"

export class DataDB extends Dexie {
  constructor() {
    super("DataDB")

    this.version(1).stores({
      data: "id, name, viewer_type, geode_object_type, visible, created_at",
    })
  }
}

export const db = new DataDB()
