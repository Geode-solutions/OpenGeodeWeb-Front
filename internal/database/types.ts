import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
import type { ModelComponentType } from "@ogw_front/types/model";

// A table of the database, by the store name Dexie knows it by
type TableName = string;

// The Dexie schema of a table: its primary key then its indexes, such as "++id, name"
type SchemaDefinition = string;

// The tables of a database version, each with its Dexie schema
type TableSchemas = Record<TableName, SchemaDefinition>;

// A version of the database schema, as Dexie numbers it
type DatabaseVersion = number;

// A saved camera position, by the id the database gives it
type CameraPositionId = number;

// The name the user gives a saved camera position
type CameraPositionName = string;

// The record of the object tree configuration, "main" for the single one stored
type TreeviewConfigId = string;

// The key of a model component style row: its model and its component
type ModelComponentStyleKey = [ModelId, ModelComponentId];

// The key of a model component type style row: its model and its component type
type ModelComponentTypeStyleKey = [ModelId, ModelComponentType];

// The schema of the database as it is open: its version and the tables of that version
interface CurrentSchema {
  currentVersion: DatabaseVersion;
  currentStores: TableSchemas;
}

export type {
  CameraPositionId,
  CameraPositionName,
  CurrentSchema,
  DatabaseVersion,
  ModelComponentStyleKey,
  ModelComponentTypeStyleKey,
  SchemaDefinition,
  TableName,
  TableSchemas,
  TreeviewConfigId,
};
