<script setup>
  import { useElementSize, useWindowSize } from "@vueuse/core"
  import Status from "@ogw_front/utils/status"
  import ViewToolbar from "@ogw_front/components/ViewToolbar"
  import { useViewerStore } from "@ogw_front/stores/viewer"
  import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
  import vtkRemoteView from "@kitware/vtk.js/Rendering/Misc/RemoteView"

  const { viewId } = defineProps({
    viewId: { type: String, default: "-1" },
  })

  const viewerStore = useViewerStore()
  const viewer = useTemplateRef("viewer")
  const { width, height } = useElementSize(viewer)

  const { width: windowWidth, height: windowHeight } = useWindowSize()

  function get_x_y(event) {
    if (viewerStore.picking_mode.value === true) {
      const { offsetX, offsetY } = event
      viewerStore.set_picked_point(offsetX, offsetY)
      viewerStore.request(
        viewer_schemas.opengeodeweb_viewer.viewer.get_point_position,
        { x: offsetX, y: offsetY },
      )
    }
  }

  const connected = ref(false)
  // oxlint-disable-next-line import/no-named-as-default-member
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
    () => viewerStore.picking_mode,
    (value) => {
      const cursor = value ? "crosshair" : "pointer"
      view.getCanvasView().setCursor(cursor)
    },
  )

  watch([width, height], () => {
    resize()
  })

  watch(
    () => viewerStore.client,
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
    if (viewerStore.status !== Status.CONNECTED) {
      return
    }
    const session = viewerStore.client.getConnection().getSession()
    view.setSession(session)
    view.setViewId(props.viewId)
    connected.value = true
    view.render()
  }

  onMounted(async () => {
    if (import.meta.client) {
      window.addEventListener("resize", resize)
      await nextTick()
      view.setContainer(viewer.value.$el)
      connect()
      resize()
    }
  })
</script>

<template>
  <ClientOnly>
    <div style="position: relative; width: 100%; height: calc(100vh - 80px)">
      <ViewToolbar />
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
        @keydown.esc="viewerStore.toggle_picking_mode(false)"
      />
    </div>
  </ClientOnly>
</template>

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
