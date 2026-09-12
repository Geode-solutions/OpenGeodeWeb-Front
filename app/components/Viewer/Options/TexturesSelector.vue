<script setup lang="ts">
import type { PropType } from "vue";
import ViewerOptionsTextureItem from "@ogw_front/components/Viewer/Options/TextureItem.vue";

interface Texture {
  id: string;
  texture_name: string;
}

const textures = defineModel({ type: Array as PropType<Texture[]> });

// oxlint-disable-next-line vue/define-props-declaration
const { id } = defineProps({
  id: { type: String, required: true },
});

const internal_textures = ref<Texture[]>([]);

onMounted(() => {
  if (textures.value === null || textures.value === undefined || textures.value.length === 0) {
    internal_textures.value = [{ id: "", texture_name: "" }];
  } else {
    internal_textures.value = textures.value;
  }
});

function update_value_event($event: { key: keyof Texture; value: string }, index: number) {
  const texture = internal_textures.value[index];
  if (!texture) {
    return;
  }
  texture[$event.key] = $event.value;
  const filtered = internal_textures.value.filter(
    (item) => item.texture_name !== "" && item.id !== "",
  );
  if (filtered.length > 0) {
    textures.value = filtered;
  }
}
</script>

<template>
  <v-row v-for="(texture, index) in internal_textures" :key="index" align="center" class="mt-2">
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
      :texture-name="texture.texture_name"
      :texture-id="texture.id"
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
