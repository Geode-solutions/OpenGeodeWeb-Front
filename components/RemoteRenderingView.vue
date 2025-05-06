<template>
  <ClientOnly>
    <div style="position: relative; width: 100%; height: calc(100vh - 80px)">
      <view-toolbar />
      <slot name="ui"></slot>
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
        @keydown.esc="viewer_store.toggle_picking_mode(false)"
      />
    </div>
  </ClientOnly>
</template>

<script setup>
  import vtkRemoteView from "@kitware/vtk.js/Rendering/Misc/RemoteView"
  import { useElementSize, useWindowSize } from "@vueuse/core"
  import viewer_schemas from "@geode/opengeodeweb-viewer/schemas.json"
  import Status from "@ogw_f/utils/status.js"

  const props = defineProps({
    viewId: { type: String, default: "-1" },
  })

  const viewer_store = use_viewer_store()
  const viewer = useTemplateRef("viewer")
  const { width, height } = useElementSize(viewer)

  const { width: windowWidth, height: windowHeight } = useWindowSize()

  function get_x_y(event) {
    if (viewer_store.picking_mode.value === true) {
      const { offsetX, offsetY } = event
      viewer_store.set_picked_point(offsetX, offsetY)
      viewer_call({
        schema: viewer_schemas.opengeodeweb_viewer.viewer.get_point_position,
        params: { x: offsetX, y: offsetY },
      })
    }
  }

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

  watch(
    () => viewer_store.picking_mode,
    (value) => {
      const cursor = value ? "crosshair" : "pointer"
      view.getCanvasView().setCursor(cursor)
    },
  )

  watch([width, height], () => {
    resize()
  })

  watch(
    () => viewer_store.client,
    () => {
      connect()
    },
  )

  watch(
    () => props.viewId,
    (id) => {
      if (connected.value) {
        view.setViewId(id)
        view.render()
      }
    },
  )

  function connect() {
    if (viewer_store.status !== Status.CONNECTED) {
      return
    }
    const session = viewer_store.client.getConnection().getSession()
    view.setSession(session)
    view.setViewId(props.viewId)
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
