import "@kitware/vtk.js/Rendering/Profiles/Geometry"
import vtkGenericRenderWindow from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow"
import vtkXMLPolyDataReader from "@kitware/vtk.js/IO/XML/XMLPolyDataReader"
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper"
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor"

import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import Status from "@ogw_f/utils/status.js"

export const useHybridViewerStore = defineStore("hybridViewer", () => {
  const viewerStore = useViewerStore()
  const dataBaseStore = useDataBaseStore()
  const db = reactive({})
  const status = ref(Status.NOT_CREATED)
  const camera_options = reactive({})
  const genericRenderWindow = reactive({})
  const is_moving = ref(false)
  const zScale = ref(1.0)
  let viewStream
  let gridActor = null

  // Helper: conversion stricte aux types/schema + logs des types
  function sanitizeCameraOptions(opts) {
    if (!opts) return null
    const toNums = (arr, size) =>
      Array.from(arr || [])
        .slice(0, size)
        .map((n) => Number(n))
    return {
      focal_point: toNums(opts.focal_point, 3),
      view_up: toNums(opts.view_up, 3),
      position: toNums(opts.position, 3),
      view_angle: Number(opts.view_angle),
      clipping_range: toNums(opts.clipping_range, 2),
    }
  }

  function logCameraOptions(label, opts) {
    const types = (arr) => Array.from(arr || []).map((v) => typeof v)
    console.log(`[Camera] ${label}`, {
      focal_point: opts?.focal_point,
      focal_point_types: types(opts?.focal_point),
      view_up: opts?.view_up,
      view_up_types: types(opts?.view_up),
      position: opts?.position,
      position_types: types(opts?.position),
      view_angle: opts?.view_angle,
      view_angle_type: typeof opts?.view_angle,
      clipping_range: opts?.clipping_range,
      clipping_range_types: types(opts?.clipping_range),
    })
  }

  async function initHybridViewer() {
    if (status.value !== Status.NOT_CREATED) return
    status.value = Status.CREATING
    genericRenderWindow.value = vtkGenericRenderWindow.newInstance({
      background: [180 / 255, 180 / 255, 180 / 255],
      listenWindowResize: false,
    })

    const webGLRenderWindow =
      genericRenderWindow.value.getApiSpecificRenderWindow()
    const imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style
    imageStyle.transition = "opacity 0.1s ease-in"
    imageStyle.zIndex = 1

    await viewerStore.ws_connect()
    viewStream = viewerStore.client.getImageStream().createViewStream("-1")
    viewStream.onImageReady((e) => {
      if (is_moving.value) return
      const webGLRenderWindow =
        genericRenderWindow.value.getApiSpecificRenderWindow()
      const imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style
      webGLRenderWindow.setBackgroundImage(e.image)
      imageStyle.opacity = 1
    })

    status.value = Status.CREATED
  }

  async function addItem(id) {
    if (!genericRenderWindow.value) {
      return
    }
    const value = dataBaseStore.db[id]
    console.log("hybridViewerStore.addItem", { value })
    const reader = vtkXMLPolyDataReader.newInstance()
    const textEncoder = new TextEncoder()
    await reader.parseAsArrayBuffer(
      textEncoder.encode(value.vtk_js.binary_light_viewable),
    )
    const polydata = reader.getOutputData(0)
    const mapper = vtkMapper.newInstance()
    mapper.setInputData(polydata)
    const actor = vtkActor.newInstance()
    actor.getProperty().setColor(20 / 255, 20 / 255, 20 / 255)
    actor.setMapper(mapper)
    const renderer = genericRenderWindow.value.getRenderer()
    const renderWindow = genericRenderWindow.value.getRenderWindow()
    renderer.addActor(actor)
    renderer.resetCamera()
    renderWindow.render()
    db[id] = { actor, polydata, mapper }
  }

  async function setVisibility(id, visibility) {
    db[id].actor.setVisibility(visibility)
    const renderWindow = genericRenderWindow.value.getRenderWindow()
    renderWindow.render()
  }
  async function setZScaling(z_scale) {
    zScale.value = z_scale
    const renderer = genericRenderWindow.value.getRenderer()
    const actors = renderer.getActors()
    actors.forEach((actor) => {
      if (actor !== gridActor) {
        const scale = actor.getScale()
        actor.setScale(scale[0], scale[1], z_scale)
      }
    })
    renderer.resetCamera()
    genericRenderWindow.value.getRenderWindow().render()
    const schema = viewer_schemas?.opengeodeweb_viewer?.viewer?.set_z_scaling
    if (!schema) return
    await viewer_call({
      schema,
      params: {
        z_scale: z_scale,
      },
    })
  }

  function syncRemoteCamera() {
    const renderer = genericRenderWindow.value.getRenderer()
    const camera = renderer.getActiveCamera()
    const params = {
      camera_options: {
        focal_point: camera.getFocalPoint(),
        view_up: camera.getViewUp(),
        position: camera.getPosition(),
        view_angle: camera.getViewAngle(),
        clipping_range: camera.getClippingRange(),
      },
    }
    viewer_call(
      {
        schema: viewer_schemas.opengeodeweb_viewer.viewer.update_camera,
        params,
      },
      {
        response_function: () => {
          remoteRender()
          for (const key in params.camera_options) {
            camera_options[key] = params.camera_options[key]
          }
        },
      },
    )
  }

  function remoteRender() {
    viewer_call({
      schema: viewer_schemas.opengeodeweb_viewer.viewer.render,
    })
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
        if (event.button == 0) {
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

    let wheelEventEndTimeout = null
    useEventListener(container, "wheel", () => {
      is_moving.value = true
      imageStyle.opacity = 0
      clearTimeout(wheelEventEndTimeout)
      wheelEventEndTimeout = setTimeout(() => {
        is_moving.value = false
        syncRemoteCamera()
      }, 600)
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

  function clear() {
    const renderer = genericRenderWindow.value.getRenderer()
    const actors = renderer.getActors()
    actors.forEach((actor) => renderer.removeActor(actor))
    genericRenderWindow.value.getRenderWindow().render()
    Object.keys(db).forEach((id) => delete db[id])
  }

  function exportStores() {
    const renderer = genericRenderWindow.value?.getRenderer?.()
    const camera = renderer?.getActiveCamera?.()
    const cameraSnapshot = camera
      ? {
          focal_point: Array.from(camera.getFocalPoint()),
          view_up: Array.from(camera.getViewUp()),
          position: Array.from(camera.getPosition()),
          view_angle: camera.getViewAngle(),
          clipping_range: Array.from(camera.getClippingRange()),
          distance: camera.getDistance(),
        }
      : camera_options
    return { zScale: zScale.value, camera_options: cameraSnapshot }
  }

  
  async function importStores(snapshot) {
    const z_scale = snapshot?.zScale
    if (z_scale != null) {
      await setZScaling(z_scale)
    }

    const cam = snapshot?.camera_options
    if (!cam) return

    const renderer = genericRenderWindow.value.getRenderer()
    const camera = renderer.getActiveCamera()

    // Appliquer les composantes (x, y, z), pas le tableau
    camera.setFocalPoint(...cam.focal_point)
    camera.setViewUp(...cam.view_up)
    camera.setPosition(...cam.position)
    camera.setViewAngle(cam.view_angle)
    camera.setClippingRange(...cam.clipping_range)

    genericRenderWindow.value.getRenderWindow().render()

    // Envoyer uniquement les champs conformes au schéma (sans distance)
    const payload = {
      camera_options: {
        focal_point: cam.focal_point,
        view_up: cam.view_up,
        position: cam.position,
        view_angle: cam.view_angle,
        clipping_range: cam.clipping_range,
      },
    }
    viewer_call(
      {
        schema: viewer_schemas.opengeodeweb_viewer.viewer.update_camera,
        params: payload,
      },
      {
        response_function: () => {
          remoteRender()
          Object.assign(camera_options, payload.camera_options)
        },
      },
    )
  }

  return {
    db,
    genericRenderWindow,
    addItem,
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
