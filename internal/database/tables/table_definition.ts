import type { SchemaDefinition, TableName } from "@ogw_internal/database/types";
// Shared shape for the static Dexie table descriptors below: each table module exports its store name and Dexie schema string (see Dexie's `.stores()` API).
export interface TableDefinition {
  name: TableName;
  schema: SchemaDefinition;
}
