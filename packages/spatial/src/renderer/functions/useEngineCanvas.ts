
import { Engine, getComponent, getOptionalMutableComponent, hasComponent } from '@ir-engine/ecs'
import { getState, none, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { destroySpatialViewer, initializeSpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { useEffect, useRef } from 'react'
import { RendererComponent } from '../components/RendererComponent'

export const useEngineCanvas = (ref: React.RefObject<HTMLElement> | null) => {
  const canvasRef = useRef(document.getElementById('engine-renderer-canvas') as HTMLCanvasElement | null)

  useEffect(() => {
    if (!ref) return
    const parent = ref.current as HTMLElement
    if (!parent) return
    const canvas = (document.getElementById('engine-renderer-canvas') as HTMLCanvasElement) ?? canvasRef.current

    const originalParent = canvas.parentElement!
    canvas.hidden = false

    parent.appendChild(canvas)

    const observer = new ResizeObserver(() => {
      getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).needsResize = true
    })

    observer.observe(parent)

    return () => {
      observer.disconnect()
      const canvas = document.getElementById('engine-renderer-canvas') as HTMLCanvasElement
      if (!parent.contains(canvas)) return
      parent.removeChild(canvas)
      originalParent.appendChild(canvas)
      canvas.hidden = true
    }
  }, [ref?.current])

  useEffect(() => {
    const canvas = document.getElementById('engine-renderer-canvas') as HTMLCanvasElement
    canvasRef.current = canvas
    initializeSpatialViewer(canvas)
    return () => {
      if (!Engine.instance) return
      canvasRef.current = null
      destroySpatialViewer()
    }
  }, [])

  /**
   * Since the viewer and XR reference spaces can technically exist without the other,
   * we need to reactively update the core renderer's scenes
   */
  const { viewerEntity, originEntity, localFloorEntity } = useMutableState(ReferenceSpaceState).value

  useEffect(() => {
    if (!viewerEntity || !originEntity) return

    const rendererComponent = getOptionalMutableComponent(viewerEntity, RendererComponent)
    if (!rendererComponent) return

    rendererComponent.scenes.merge([originEntity])

    return () => {
      if (!Engine.instance) return
      if (!hasComponent(viewerEntity, RendererComponent)) return
      const index = rendererComponent.scenes.value.indexOf(originEntity)
      rendererComponent.scenes[index].set(none)
    }
  }, [viewerEntity, originEntity])

  useEffect(() => {
    if (!viewerEntity || !localFloorEntity) return

    const rendererComponent = getOptionalMutableComponent(viewerEntity, RendererComponent)
    if (!rendererComponent) return

    rendererComponent.scenes.merge([localFloorEntity])

    return () => {
      if (!Engine.instance) return
      if (!hasComponent(viewerEntity, RendererComponent)) return
      const index = rendererComponent.scenes.value.indexOf(localFloorEntity)
      rendererComponent.scenes[index].set(none)
    }
  }, [viewerEntity, localFloorEntity])
}

export const useRemoveEngineCanvas = () => {
  useEffect(() => {
    const canvas = document.getElementById('engine-renderer-canvas')!
    const parent = canvas.parentElement
    parent?.removeChild(canvas)

    return () => {
      parent?.appendChild(canvas)
    }
  }, [])

  return null
}
