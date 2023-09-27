<template>
  <div style="position: relative; width: 100%; height: 100%;">
    <view-toolbar />
    <v-col style="overflow: hidden; position: relative; z-index: 0; height: 100%; width: 100%" ref="viewer"
      @click="get_x_y" @keydown.esc="app_store.toggle_picking_mode(false)" class="pa-0">
    </v-col>
  </div>
</template>

<script setup>
import vtkRemoteView from '@kitware/vtk.js/Rendering/Misc/RemoteView';
import { useElementSize } from '@vueuse/core'

const viewer_store = use_viewer_store()
const { picking_mode } = storeToRefs(viewer_store)
const websocket_store = use_websocket_store()
const { client, is_client_created } = storeToRefs(websocket_store)

function get_x_y (event) {
  if (picking_mode.value === true) {
    const { offsetX, offsetY } = event
    viewer_store.set_picked_point(offsetX, offsetY)
  }
}

const props = defineProps({
  viewId: { type: String, default: '-1' }
})

const viewer = ref(null)
const { width, height } = useElementSize(viewer)

function resize () {
  view.getCanvasView().setSize(0, 0)
  view.resize();
}

watch(picking_mode, value => {
  const cursor = value == true ? 'crosshair' : 'pointer'
  view.getCanvasView().setCursor(cursor)
})
watch(width, value => {
  resize()
})
watch(height, value => {
  resize()
})
const { viewId } = toRefs(props)
const connected = ref(false)

const view = vtkRemoteView.newInstance({ rpcWheelEvent: 'viewport.mouse.zoom.wheel' })
// default of 0.5 causes 2x size labels on high-DPI screens. 1 good for demo, not for production.
if (location.hostname.split('.')[0] === 'localhost') {
  view.setInteractiveRatio(1)
}


watch(client, (new_client) => {
  connect()
})

watch(viewId, (id) => {
  if (connected.value) {
    view.setViewId(id)
    view.render()
  }
})

onMounted(async () => {
  if (process.client) {
    window.addEventListener('resize', resize)
    await nextTick()
    view.setContainer(viewer.value.$el)
    connect()
    resize()
  }
})

function connect () {
  if (!is_client_created.value) { return }
  console.log('connecting', client.value)
  const session = client.value.getConnection().getSession()
  view.setSession(session)
  view.setViewId(viewId.value)
  connected.value = true
  view.render()
}
</script>
