// oxlint-disable-next-line import/no-unassigned-import
import "@kitware/vtk.js/Rendering/Profiles/Geometry"
import { newInstance as vtkActor } from "@kitware/vtk.js/Rendering/Core/Actor"
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow"
import { newInstance as vtkMapper } from "@kitware/vtk.js/Rendering/Core/Mapper"
import { newInstance as vtkXMLPolyDataReader } from "@kitware/vtk.js/IO/XML/XMLPolyDataReader"

import Status from "@ogw_front/utils/status"
import { database } from "../../internal/database/database.js"
import { useDataStore } from "@ogw_front/stores/data"
import { useViewerStore } from "@ogw_front/stores/viewer"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

const RGB_MAX = 255
const BACKGROUND_GREY_VALUE = 180
const ACTOR_DARK_VALUE = 20
const BACKGROUND_COLOR = [
  BACKGROUND_GREY_VALUE / RGB_MAX,
  BACKGROUND_GREY_VALUE / RGB_MAX,
  BACKGROUND_GREY_VALUE / RGB_MAX,
]
const ACTOR_COLOR = [
  ACTOR_DARK_VALUE / RGB_MAX,
  ACTOR_DARK_VALUE / RGB_MAX,
  ACTOR_DARK_VALUE / RGB_MAX,
]
const WHEEL_TIME_OUT_MS = 600

export const useHybridViewerStore = defineStore("hybridViewer", () => {
  const viewerStore = useViewerStore()
  const dataStore = useDataStore()
  const hybridDb = reactive({})
  const status = ref(Status.NOT_CREATED)
  const camera_options = reactive({})
  const genericRenderWindow = reactive({})
  const is_moving = ref(false)
  const zScale = ref(1)
  let viewStream = undefined
  let gridActor = undefined

  async function initHybridViewer() {
    if (status.value !== Status.NOT_CREATED) {
      return
    }
    status.value = Status.CREATING
    genericRenderWindow.value = vtkGenericRenderWindow({
      background: BACKGROUND_COLOR,
      listenWindowResize: false,
    })

    const webGLRenderWindow =
      genericRenderWindow.value.getApiSpecificRenderWindow()
    const imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style
    imageStyle.transition = "opacity 0.1s ease-in"
    imageStyle.zIndex = 1

    await viewerStore.ws_connect()
    viewStream = viewerStore.client.getImageStream().createViewStream("-1")
    viewStream.onImageReady((event) => {
      if (is_moving.value) {
        return
      }
      const webGLRenderWindow =
        genericRenderWindow.value.getApiSpecificRenderWindow()
      const imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style
      webGLRenderWindow.setBackgroundImage(event.image)
      imageStyle.opacity = 1
    })

    status.value = Status.CREATED
  }

  async function addItem(id) {
    if (!genericRenderWindow.value) {
      return
    }
    const value = await database.data.get(id)
    console.log("hybridViewerStore.addItem", { value })
    const reader = vtkXMLPolyDataReader()
    const textEncoder = new TextEncoder()
    await reader.parseAsArrayBuffer(
      textEncoder.encode(value.binary_light_viewable),
    )
    const polydata = reader.getOutputData(0)
    const mapper = vtkMapper()
    mapper.setInputData(polydata)
    const actor = vtkActor()
    actor.getProperty().setColor(ACTOR_COLOR)
    actor.setMapper(mapper)
    const renderer = genericRenderWindow.value.getRenderer()
    const renderWindow = genericRenderWindow.value.getRenderWindow()
    renderer.addActor(actor)
    renderer.resetCamera()
    renderWindow.render()
    hybridDb[id] = { actor, polydata, mapper }
  }

  async function removeItem(id) {
    if (!hybridDb[id]) {
      return
    }
    const renderer = genericRenderWindow.value.getRenderer()
    renderer.removeActor(hybridDb[id].actor)
    genericRenderWindow.value.getRenderWindow().render()
    delete hybridDb[id]
  }

  async function setVisibility(id, visibility) {
    hybridDb[id].actor.setVisibility(visibility)
    const renderWindow = genericRenderWindow.value.getRenderWindow()
    renderWindow.render()
  }
  async function setZScaling(z_scale) {
    zScale.value = z_scale
    const renderer = genericRenderWindow.value.getRenderer()
    const actors = renderer.getActors()
    for (const actor of actors) {
      if (actor !== gridActor) {
        const scale = actor.getScale()
        actor.setScale(scale[0], scale[1], z_scale)
      }
    }
    renderer.resetCamera()
    genericRenderWindow.value.getRenderWindow().render()
    const schema = viewer_schemas?.opengeodeweb_viewer?.viewer?.set_z_scaling
    if (!schema) {
      return
    }
    const viewerStore = useViewerStore()
    await viewerStore.request(schema, {
      z_scale,
    })
    remoteRender()
  }

  function syncRemoteCamera() {
    console.log("syncRemoteCamera")
    const renderer = genericRenderWindow.value.getRenderer()
    const camera = renderer.getActiveCamera()
    const params = {
      camera_options: {
        focal_point: [...camera.getFocalPoint()],
        view_up: [...camera.getViewUp()],
        position: [...camera.getPosition()],
        view_angle: camera.getViewAngle(),
        clipping_range: [...camera.getClippingRange()],
        distance: camera.getDistance(),
      },
    }
    const viewerStore = useViewerStore()
    viewerStore.request(
      viewer_schemas.opengeodeweb_viewer.viewer.update_camera,
      params,
      {
        response_function: () => {
          remoteRender()
          for (const key in params.camera_options) {
            if (Object.hasOwn(params.camera_options, key)) {
              camera_options[key] = params.camera_options[key]
            }
          }
        },
      },
    )
  }

  function remoteRender() {
    const viewerStore = useViewerStore()
    return viewerStore.request(viewer_schemas.opengeodeweb_viewer.viewer.render)
  }

  function setContainer(container) {
    genericRenderWindow.value.setContainer(container.value.$el)
    const webGLRenderWindow =
      genericRenderWindow.value.getApiSpecificRenderWindow()
    webGLRenderWindow.setUseBackgroundImage(true)
    const imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style
    imageStyle.transition = "opacity 0.1s ease-in"
    imageStyle.zIndex = 1
    resize(container.value.$el.offsetWidth, container.value.$el.offsetHeight)
    console.log("setContainer", container.value.$el)

    useMousePressed({
      target: container,
      onPressed: (event) => {
        console.log("onPressed")
        if (event.button === 0) {
          is_moving.value = true
          event.stopPropagation()
          imageStyle.opacity = 0
        }
      },
      onReleased: () => {
        if (!is_moving.value) {
          return
        }
        is_moving.value = false
        console.log("onReleased")
        syncRemoteCamera()
      },
    })

    let wheelEventEndTimeout = undefined
    useEventListener(container, "wheel", () => {
      is_moving.value = true
      imageStyle.opacity = 0
      clearTimeout(wheelEventEndTimeout)
      wheelEventEndTimeout = setTimeout(() => {
        is_moving.value = false
        syncRemoteCamera()
      }, WHEEL_TIME_OUT_MS)
    })
  }

  async function resize(width, height) {
    if (
      viewerStore.status !== Status.CONNECTED ||
      status.value !== Status.CREATED
    ) {
      return
    }
    const webGLRenderWindow =
      genericRenderWindow.value.getApiSpecificRenderWindow()
    const canvas = webGLRenderWindow.getCanvas()
    canvas.width = width
    canvas.height = height
    await nextTick()
    webGLRenderWindow.setSize(width, height)
    viewStream.setSize(width, height)
    const renderWindow = genericRenderWindow.value.getRenderWindow()
    renderWindow.render()
    remoteRender()
  }

  function exportStores() {
    const renderer = genericRenderWindow.value.getRenderer()
    const camera = renderer.getActiveCamera()
    const cameraSnapshot = camera
      ? {
          focal_point: [...camera.getFocalPoint()],
          view_up: [...camera.getViewUp()],
          position: [...camera.getPosition()],
          view_angle: camera.getViewAngle(),
          clipping_range: [...camera.getClippingRange()],
          distance: camera.getDistance(),
        }
      : camera_options
    return { zScale: zScale.value, camera_options: cameraSnapshot }
  }

  async function importStores(snapshot) {
    if (!snapshot) {
      console.warn("importStores called with undefined snapshot")
      return
    }
    const z_scale = snapshot.zScale

    function applyCamera() {
      const { camera_options } = snapshot
      if (!camera_options) {
        return
      }

      const renderer = genericRenderWindow.value.getRenderer()
      const camera = renderer.getActiveCamera()

      camera.setFocalPoint(...camera_options.focal_point)
      camera.setViewUp(...camera_options.view_up)
      camera.setPosition(...camera_options.position)
      camera.setViewAngle(camera_options.view_angle)
      camera.setClippingRange(...camera_options.clipping_range)

      genericRenderWindow.value.getRenderWindow().render()

      const payload = {
        camera_options: {
          focal_point: [...camera_options.focal_point],
          view_up: [...camera_options.view_up],
          position: [...camera_options.position],
          view_angle: camera_options.view_angle,
          clipping_range: [...camera_options.clipping_range],
        },
      }
      const viewerStore = useViewerStore()
      return viewerStore.request(
        viewer_schemas.opengeodeweb_viewer.viewer.update_camera,
        payload,
        {
          response_function: () => {
            remoteRender()
            Object.assign(camera_options, payload.camera_options)
          },
        },
      )
    }

    if (typeof z_scale === "number") {
      await setZScaling(z_scale)
      return await applyCamera()
    }
    return await applyCamera()
  }

  function clear() {
    const renderer = genericRenderWindow.value.getRenderer()
    const actors = renderer.getActors()
    for (const actor of actors) {
      renderer.removeActor(actor)
    }
    genericRenderWindow.value.getRenderWindow().render()
    for (const id of Object.keys(hybridDb)) {
      delete hybridDb[id]
    }
  }

  return {
    hybridDb,
    genericRenderWindow,
    addItem,
    removeItem,
    setVisibility,
    setZScaling,
    syncRemoteCamera,
    initHybridViewer,
    remoteRender,
    resize,
    setContainer,
    zScale,
    clear,
    exportStores,
    importStores,
  }
})
