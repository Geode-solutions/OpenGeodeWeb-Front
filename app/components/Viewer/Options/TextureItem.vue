<script setup lang="ts">
import FileUploader from "@ogw_front/components/FileUploader.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { useBackStore } from "@ogw_front/stores/back";

// Mirrors FileUploader's own (unexported) UploadFile type.
type UploadFile = File & { isConfigured?: boolean; displayName?: string };

const emit = defineEmits(["update_value"]);

const {
  id,
  textureId: propTextureId,
  textureName: propTextureName,
} = defineProps({
  id: { type: String, required: true },
  textureId: { type: String, required: true },
  textureName: { type: String, required: true },
});

const textureName = ref(propTextureName);
const textureId = ref(propTextureId);

watch(
  () => propTextureName,
  (newVal) => {
    textureName.value = newVal;
  },
);

watch(
  () => propTextureId,
  (newVal) => {
    textureId.value = newVal;
  },
);

const textureCoordinates = ref<string[]>([]);
const backStore = useBackStore();

function getTextureCoordinates() {
  const schema = back_schemas.opengeodeweb_back.texture_coordinates;
  const params = { id };
  backStore.request(
    { schema, params },
    {
      response_function: (response: unknown) => {
        textureCoordinates.value = (response as { texture_coordinates: string[] })
          .texture_coordinates;
      },
    },
  );
}

onMounted(() => {
  getTextureCoordinates();
});

async function files_uploaded_event(value: UploadFile[]) {
  if (value.length > 0 && value[0]) {
    const schema = back_schemas.opengeodeweb_back.save_viewable_file;
    const params = {
      geode_object_type: "RasterImage2D",
      filename: value[0].name,
    };
    await backStore.request(
      { schema, params },
      {
        response_function: (response: unknown) => {
          textureId.value = (response as { id: string }).id;
        },
      },
    );
  }
}

watch(textureName, (value) => {
  emit("update_value", { key: "texture_name", value });
});

watch(textureId, (value) => {
  emit("update_value", { key: "id", value });
});
</script>

<style>
.v-input__details {
  display: none;
}
</style>

<template>
  <v-col cols="8" class="pa-1">
    <v-select
      v-model="textureName"
      :items="textureCoordinates"
      label="Select a texture"
      density="compact"
      hide-details
    />
  </v-col>
  <v-col cols="1" class="ma-1 d-flex justify-center align-center">
    <v-badge :model-value="textureId !== ''" color="white" floating dot offset-x="10" offset-y="10">
      <FileUploader
        @files_uploaded="files_uploaded_event($event)"
        :accept="['image/png', 'image/jpeg', 'image/bmp']"
        :autoUpload="true"
        :multiple="true"
        :mini="true"
        class="mt-2"
      />
    </v-badge>
  </v-col>
  <v-col v-if="textureName === '' || textureId === ''" cols="1">
    <v-icon size="20" icon="mdi-close-circle" v-tooltip:bottom="'Invalid texture'" />
  </v-col>
</template>
