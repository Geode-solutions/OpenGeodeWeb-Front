// Shared shape for the static Dexie table descriptors below: each table module exports its store name and Dexie schema string (see Dexie's `.stores()` API).
export interface TableDefinition {
  name: string;
  schema: string;
}
