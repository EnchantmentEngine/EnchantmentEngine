import { PerspectiveCamera, Vector2, WebGLRenderer } from 'three'

import { getCanvasBlob } from '@ir-engine/client-core/src/common/utils'
import { Entity } from '@ir-engine/ecs'
import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { getState } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'

import { ReferenceSpaceState } from '@ir-engine/spatial'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { getNestedVisibleChildren, getSceneParameters } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { EditorState } from '../services/EditorServices'

function getResizedCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const tmpCanvas = document.createElement('canvas')
  tmpCanvas.width = width
  tmpCanvas.height = height
  const ctx = tmpCanvas.getContext('2d')
  if (ctx) ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height)
  return tmpCanvas
}

/**
 * Function takeScreenshot used for taking screenshots.
 *
 * @param  {any}  width
 * @param  {any}  height
 * @param  {any}  quality
 * @return {Promise}        [generated screenshot according to height and width]
 */

export async function takeScreenshot(
  scenePreviewCamera: PerspectiveCamera,
  scenePreviewCameraEntity: Entity,
  width: number,
  height: number,
  quality: number = 0.9,
  format = 'jpeg' as 'jpeg' | 'png',
  hideHelpers = true
): Promise<Blob | null> {
  const prevAspect = scenePreviewCamera.aspect
  const prevLayers = scenePreviewCamera.layers
  const prevLayersMask = scenePreviewCamera.layers.mask
  const camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)

  // Setting up scene preview camera
  scenePreviewCamera.aspect = width / height
  scenePreviewCamera.updateProjectionMatrix()
  scenePreviewCamera.layers.disableAll()
  scenePreviewCamera.layers.set(ObjectLayers.Scene)

  const rendererComponent = getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent)
  const renderer = rendererComponent.renderer! as WebGLRenderer
  const renderContext = rendererComponent.renderContext! as WebGL2RenderingContext
  const effectComposer = rendererComponent.effectComposer!

  if (hideHelpers) {
    effectComposer.OutlineEffect?.clearSelection()
  }

  const originalSize = renderer.getSize(new Vector2())
  const pixelRatio = renderer.getPixelRatio()
  effectComposer.setMainCamera(scenePreviewCamera as PerspectiveCamera)

  // Rendering the scene to the new canvas with given size
  await new Promise<void>((resolve, reject) => {
    const interval = setInterval(() => {
      const viewport = renderContext.getParameter(renderContext.VIEWPORT)
      if (viewport[2] === Math.round(width) && viewport[3] === Math.round(height)) {
        console.log('Resized viewport')
        clearTimeout(timeout)
        clearInterval(interval)
        resolve()
      }
    }, 100)

    const timeout = setTimeout(() => {
      console.warn('Could not resize viewport in time')
      clearTimeout(timeout)
      clearInterval(interval)
      reject()
    }, 10000)

    // set up effect composer
    effectComposer.setMainCamera(scenePreviewCamera as PerspectiveCamera)
    renderer.setPixelRatio(1)
    effectComposer.setSize(width, height, false)
  })

  const entitiesToRender = rendererComponent.scenes.map(getNestedVisibleChildren).flat()
  const { background, environment, fog, children } = getSceneParameters(entitiesToRender, scenePreviewCameraEntity)
  const _scene = rendererComponent.scene
  _scene.children = children
  _scene.background = background
  _scene.environment = environment
  _scene.fog = fog

  ObjectComponent.activeRender = true
  effectComposer.setMainScene(_scene)
  effectComposer.setMainCamera(scenePreviewCamera as PerspectiveCamera)
  effectComposer.render()
  ObjectComponent.activeRender = false
  const canvas = getResizedCanvas(renderer.domElement, width, height)

  // Restoring previous state
  scenePreviewCamera.layers = prevLayers
  scenePreviewCamera.layers.mask = prevLayersMask
  scenePreviewCamera.aspect = prevAspect
  scenePreviewCamera.updateProjectionMatrix()

  // restore
  effectComposer.setMainCamera(camera)
  renderer.setPixelRatio(pixelRatio)
  effectComposer.setSize(originalSize.width, originalSize.height, false)

  const imageBlob = await getCanvasBlob(
    canvas,
    format === 'jpeg' ? 'image/jpeg' : 'image/png',
    format === 'jpeg' ? quality : 1
  )

  return imageBlob
}

/** @todo make size, compression & format configurable */
export const downloadScreenshot = () => {
  const cameraEntity = getState(ReferenceSpaceState).viewerEntity
  const camera = getComponent(cameraEntity, CameraComponent)
  takeScreenshot(camera, cameraEntity, 1920 * 4, 1080 * 4, 1, 'png', false).then((blob) => {
    if (!blob) return

    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')

    const editorState = getState(EditorState)

    link.href = blobUrl
    link.download = editorState.projectName + '_' + editorState.sceneName + '_thumbnail.png'

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
  })
}
