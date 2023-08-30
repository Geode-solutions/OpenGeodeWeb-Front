<template>
    <v-row dense :class="[$style.floatToolbar, 'flex-column']">
        <v-col>
            <v-tooltip location="left">
                Reset camera
                <template #activator="{ props }">
                    <v-btn @click.stop=reset_camera icon="mdi-crop-free" density="comfortable" v-bind="props" />
                </template>
            </v-tooltip>
        </v-col>
    </v-row>
</template>

<script setup>
const viewer_store = use_viewer_store()
function reset_camera() {
    viewer_store.reset_camera()
}
</script>

<style module>
.floatToolbar {
    position: absolute;
    z-index: 2;
    right: 20px;
    top: 20px;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 16px;
}
</style>