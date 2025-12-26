import Dexie from "dexie"

/**
 * ImportedDataDB - Dexie database for storing imported 3D model data
 * This replaces the in-memory reactive object storage with persistent IndexedDB storage
 */
export class ImportedDataDB extends Dexie {
    constructor() {
        super("ImportedDataDB")

        // Define schema version 1
        this.version(1).stores({
            importedData:
                "id, name, viewer_type, geode_object_type, visible, created_at",
        })
    }
}

// Export singleton instance
export const db = new ImportedDataDB()
