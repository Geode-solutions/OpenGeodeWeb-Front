<template>
  <ClientOnly>
    <div style="position: relative; width: 100%; height: calc(100vh - 80px)">
      <view-toolbar />
      <div
        style="
          position: absolute;
          z-index: 2;
          left: 0;
          top: 0;
          background-color: transparent;
          border-radius: 16px;
        "
      >
        <slot name="tree-object"></slot>
      </div>
      <v-col
        ref="viewer"
        style="
          overflow: hidden;
          position: relative;
          z-index: 0;
          height: 100%;
          width: 100%;
        "
        class="pa-0"
        @click="get_x_y"
        @keydown.esc="app_store.toggle_picking_mode(false)"
      >
        <slot name="ui"></slot>
      </v-col>
    </div>
  </ClientOnly>
</template>

<script setup>
  import vtkRemoteView from "@kitware/vtk.js/Rendering/Misc/RemoteView"
  import { useElementSize, useWindowSize } from "@vueuse/core"
  import viewer_schemas from "@geode/opengeodeweb-viewer/schemas.json"

  const viewer_store = use_viewer_store()
  const { client, is_running, picking_mode } = storeToRefs(viewer_store)

  const viewer = ref(null)
  const { width, height } = useElementSize(viewer)

  const { width: windowWidth, height: windowHeight } = useWindowSize()

  function get_x_y(event) {
    if (picking_mode.value === true) {
      const { offsetX, offsetY } = event
      viewer_store.set_picked_point(offsetX, offsetY)
      viewer_call({
        schema: viewer_schemas.opengeodeweb_viewer.viewer.get_point_position,
        params: { x: offsetX, y: offsetY },
      })
    }
  }

  const props = defineProps({
    viewId: { type: String, default: "-1" },
  })

  const { viewId } = toRefs(props)
  const connected = ref(false)

  const view = vtkRemoteView.newInstance({
    rpcWheelEvent: "viewport.mouse.zoom.wheel",
  })

  if (location.hostname.split(".")[0] === "localhost") {
    view.setInteractiveRatio(1)
  }

  function resize() {
    if (view) {
      view.getCanvasView().setSize(0, 0)
      view.resize()
    }
  }

  watch([windowWidth, windowHeight], () => {
    resize()
  })

  watch(picking_mode, (value) => {
    const cursor = value ? "crosshair" : "pointer"
    view.getCanvasView().setCursor(cursor)
  })

  watch([width, height], () => {
    resize()
  })

  watch(client, () => {
    connect()
  })

  watch(viewId, (id) => {
    if (connected.value) {
      view.setViewId(id)
      view.render()
    }
  })

  function connect() {
    if (!is_running.value) {
      return
    }
    const session = client.value.getConnection().getSession()
    view.setSession(session)
    view.setViewId(viewId.value)
    connected.value = true
    view.render()
  }

  onMounted(async () => {
    if (process.client) {
      window.addEventListener("resize", resize)
      await nextTick()
      view.setContainer(viewer.value.$el)
      connect()
      resize()
    }
  })
</script>

<style scoped>
  .list {
    position: absolute;
    z-index: 2;
    left: 0;
    top: 0;
    background-color: transparent;
    border-radius: 16px;
  }
</style>
