<script setup>
  import ViewerOptionsTextureItem from "@ogw_front/components/Viewer/Options/TextureItem"

  const textures = defineModel()

  const { id } = defineProps({
    id: { type: String, required: true },
  })

  const internal_textures = ref([])

  onMounted(() => {
    if (textures.value !== null) {
      internal_textures.value = textures.value
    } else {
      internal_textures.value = [{ id: "", texture_name: "" }]
    }
  })

  function update_value_event($event, index) {
    internal_textures.value[index][$event.key] = $event.value
    const filtered = internal_textures.value.filter(
      (texture) => texture.texture_name !== "" && texture.id !== "",
    )
    if (filtered.length !== 0) {
      textures.value = filtered
    }
  }
</script>

<template>
  <v-row
    v-for="(texture, index) in internal_textures"
    :key="texture"
    align="center"
  >
    <br />
    <v-col cols="1" class="pa-0">
      <v-icon
        v-if="internal_textures.length > 1"
        icon="mdi-minus"
        size="20"
        v-tooltip:bottom="'Remove texture'"
        @click="internal_textures.splice(index, 1)"
      />
    </v-col>
    <ViewerOptionsTextureItem
      :id="id"
      :texture_name="internal_textures[index].texture_name"
      :texture_id="internal_textures[index].id"
      @update_value="update_value_event($event, index)"
    />
  </v-row>
  <v-row>
    <v-spacer />
    <v-col cols="3">
      <v-icon
        v-if="internal_textures.length < 4"
        icon="mdi-plus"
        v-tooltip:bottom="'Add a texture'"
        size="20"
        @click="internal_textures.push({ texture_name: '', id: '' })"
      />
    </v-col>
  </v-row>
</template>
