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
    if (cam) {
      console.log("[hybrid_viewer] importStores snapshot camera", cam)
      const renderer = genericRenderWindow.value.getRenderer()
      const camera = renderer.getActiveCamera()
  
      const fp = toNumArray(cam.focal_point, 3)
      const vu = toNumArray(cam.view_up, 3)
      const pos = toNumArray(cam.position, 3)
      const cr = toNumArray(cam.clipping_range, 2)
      const va = Number(cam.view_angle)
  
      const valid =
        fp && vu && pos && cr && Number.isFinite(va)
  
      console.log("[hybrid_viewer] importStores normalized camera", {
        focal_point: fp, view_up: vu, position: pos, view_angle: va, clipping_range: cr, valid
      })
  
      if (!valid) {
        console.warn("[hybrid_viewer] importStores camera skipped: invalid snapshot camera", cam)
        return
      }
  
      camera.setFocalPoint(fp)
      camera.setViewUp(vu)
      camera.setPosition(pos)
      camera.setViewAngle(va)
      camera.setClippingRange(cr)
  
      genericRenderWindow.value.getRenderWindow().render()
  
      console.log("[hybrid_viewer] importStores -> viewer.update_camera", {
        camera_options: { focal_point: fp, view_up: vu, position: pos, view_angle: va, clipping_range: cr },
      })
      await viewer_call({
        schema: viewer_schemas.opengeodeweb_viewer.viewer.update_camera,
        params: {
          camera_options: {
            focal_point: fp,
            view_up: vu,
            position: pos,
            view_angle: va,
            clipping_range: cr,
          },
        },
      })
  
      Object.assign(camera_options, {
        focal_point: fp,
        view_up: vu,
        position: pos,
        view_angle: va,
        clipping_range: cr,
      })
    }
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
