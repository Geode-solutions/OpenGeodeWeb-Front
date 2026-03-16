import { Dexie } from "dexie"
import { dataTable } from "./tables/data"
import { modelComponentsRelationTable } from "./tables/model_components_relation"
import { modelComponentsTable } from "./tables/model_components"
import { dataStyleTable } from "./tables/data_style"
import { modelComponentDataStyleTable } from "./tables/model_component_datastyle"

export class BaseDatabase extends Dexie {
    constructor(name) {
        super(name)
    }

    static get initialStores() {
        return {
            [dataTable.name]: dataTable.schema,
            [modelComponentsTable.name]: modelComponentsTable.schema,
            [dataStyleTable.name]: dataStyleTable.schema,
            [modelComponentDataStyleTable.name]: modelComponentDataStyleTable.schema,
            [modelComponentsRelationTable.name]: modelComponentsRelationTable.schema,
        }
    }

    async clear() {
        return Promise.all(this.tables.map((table) => table.clear()))
    }
}
