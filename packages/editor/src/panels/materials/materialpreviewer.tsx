import React, { useCallback, useEffect, useRef } from 'react'
import { BufferAttribute, Mesh, SphereGeometry } from 'three'

import { useRender3DPanelSystem } from '@ir-engine/client-core/src/hooks/useRender3DPanelSystem'
import { EntityID, getComponent, Layers, setComponent, SourceID, UUIDComponent } from '@ir-engine/ecs'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { computeTransformPivot } from '@ir-engine/spatial/src/common/functions/TransformPivot'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { MaterialInstanceComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { SelectionState } from '../../services/SelectionServices'
import { MATERIALS_PANEL_ID } from './helpers'

function MaterialPreviewCanvas() {
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const renderPanel = useRender3DPanelSystem(panelRef)
  const selectedMaterial = useHookstate(getMutableState(SelectionState).selectedEntities[0])
  const panel = document.getElementById(MATERIALS_PANEL_ID)
  useEffect(() => {
    const { sceneEntity, cameraEntity } = renderPanel
    if (
      !selectedMaterial.value
      // || selectedMaterial.value === getOptionalComponent(sceneEntity, MaterialInstanceComponent)?.uuid[0]
    )
      return

    setComponent(sceneEntity, TransformComponent)
    setComponent(sceneEntity, UUIDComponent, {
      entitySourceID: 'preview' as SourceID,
      entityID: 'material' as EntityID
    })
    setComponent(sceneEntity, NameComponent, 'Material Preview Entity')
    setComponent(sceneEntity, VisibleComponent, true)
    const sphereMesh = new Mesh(new SphereGeometry(5, 32, 32))
    sphereMesh.geometry.attributes['color'] = new BufferAttribute(
      new Float32Array(sphereMesh.geometry.attributes.position.count * 3).fill(1),
      3
    )
    sphereMesh.geometry.attributes['uv1'] = sphereMesh.geometry.attributes['uv']
    setComponent(sceneEntity, MeshComponent, sphereMesh)
    const selectedMaterialEntity = UUIDComponent.getEntityByUUID(selectedMaterial.value, Layers.Authoring)
    setComponent(sceneEntity, MaterialInstanceComponent, { entities: [selectedMaterialEntity] })

    const pivot = computeTransformPivot([sceneEntity])
    if (pivot.position) {
      CameraOrbitComponent.setFocus(cameraEntity, pivot.position, pivot.bounds)
    }

    return () => {}
  }, [selectedMaterial])

  useEffect(() => {
    if (!panelRef?.current) return
    if (!panel) return
    getComponent(renderPanel.cameraEntity, RendererComponent).needsResize = true

    const observer = new ResizeObserver(() => {
      getComponent(renderPanel.cameraEntity, RendererComponent).needsResize = true
    })

    observer.observe(panel)

    return () => {
      observer.disconnect()
    }
  }, [panelRef])

  return (
    <>
      <div id="materialPreview" className="aspect-square h-full max-h-[200px] min-h-[100px] w-full">
        <canvas id="material-preview-canvas" ref={panelRef} className="pointer-events-auto" />
      </div>
    </>
  )
}

export const MaterialPreviewer = () => {
  const selectedMaterial = useHookstate(getMutableState(SelectionState).selectedEntities[0])
  const panel = document.getElementById(MATERIALS_PANEL_ID)!
  const disableScroll = (event: Event) => {
    event.stopPropagation()
    event.preventDefault()
  }

  const captureMouse = useCallback(() => {
    if (panel) {
      panel.addEventListener('wheel', disableScroll, { passive: false })
      panel.addEventListener('touchmove', disableScroll, { passive: false })
    }
  }, [panel, disableScroll])

  const releaseMouse = useCallback(() => {
    if (panel) {
      panel.removeEventListener('wheel', disableScroll)
      panel.removeEventListener('touchmove', disableScroll)
    }
  }, [panel, disableScroll])

  if (!selectedMaterial.value) return null

  return (
    <div className="rounded-lg bg-zinc-800 p-2" onMouseEnter={captureMouse} onMouseLeave={releaseMouse}>
      <MaterialPreviewCanvas />
    </div>
  )
}
