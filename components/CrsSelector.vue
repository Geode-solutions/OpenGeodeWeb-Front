<template>
  <v-text-field
    v-model="search"
    append-icon="mdi-magnify"
    label="Search"
    single-line
    hide-details
  ></v-text-field>
  <v-data-table
    v-model="selected_crs"
    :v-model:items-per-page="10"
    :headers="headers"
    :items="crs_list"
    item-value="code"
    class="elevation-1"
    density="compact"
    fixed-header
    select-strategy="single"
    show-select
    :search="search"
    :loading="data_table_loading"
    loading-text="Loading... Please wait"
  ></v-data-table>
</template>

<script setup>
  import schema from "@/assets/schemas/CrsSelector.json"
  const emit = defineEmits([
    "update_values",
    "increment_step",
    "decrement_step",
  ])

  const props = defineProps({
    input_geode_object: { type: String, required: true },
    key_to_update: { type: String, required: true },
  })

  const { input_geode_object, key_to_update } = props

  const search = ref("")
  const data_table_loading = ref(false)
  const crs_list = ref([])
  const selected_crs = ref([])
  const toggle_loading = useToggle(data_table_loading)

  watch(selected_crs, (new_value) => {
    const crs = get_selected_crs(new_value[0])
    const keys_values_object = {
      [key_to_update]: crs,
    }
    emit("update_values", keys_values_object)
    emit("increment_step")
  })

  function get_selected_crs(crs_code) {
    for (let i = 0; i <= crs_list.value.length; i++) {
      if (crs_list.value[i]["code"] == crs_code) {
        return crs_list.value[i]
      }
    }
  }

  async function get_crs_table() {
    const params = { input_geode_object }
    toggle_loading()
    await api_fetch(
      { schema, params },
      {
        response_function: (response) => {
          crs_list.value = response._data.crs_list
        },
      },
    )
    toggle_loading()
  }

  const headers = [
    {
      title: "Authority",
      align: "start",
      sortable: true,
      key: "authority",
    },
    { title: "Code", align: "end", key: "code" },
    { title: "Name", align: "end", key: "name" },
  ]

  await get_crs_table()
</script>
