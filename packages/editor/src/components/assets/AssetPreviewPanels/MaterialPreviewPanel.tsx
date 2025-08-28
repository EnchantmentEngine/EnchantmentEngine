import React, { useEffect, useRef } from 'react'
import { Mesh, SphereGeometry } from 'three'

import { useRender3DPanelSystem } from '@ir-engine/client-core/src/hooks/useRender3DPanelSystem'
import { EntityID, getComponent, Layers, setComponent, SourceID, useComponent, UUIDComponent } from '@ir-engine/ecs'
import { EnvMapComponent } from '@ir-engine/engine/src/scene/components/EnvmapComponent'
import { getState, useMutableState } from '@ir-engine/hyperflux'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { TransformPivot, TransformSpace } from '@ir-engine/spatial/src/common/constants/TransformConstants'
import { computeTransformPivot } from '@ir-engine/spatial/src/common/functions/TransformPivot'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/materials/MaterialComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { SelectionState } from '../../../services/SelectionServices'

export const MaterialPreviewCanvas = () => {
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const renderPanel = useRender3DPanelSystem(panelRef)
  const selectedMaterial = useMutableState(SelectionState).selectedEntities[0]
  useEffect(() => {
    if (!selectedMaterial.value) return
    const { sceneEntity, cameraEntity } = renderPanel
    setComponent(sceneEntity, NameComponent, 'Material Preview Entity')
    setComponent(sceneEntity, UUIDComponent, { entitySourceID: 'preview' as SourceID, entityID: 'scene' as EntityID })
    setComponent(sceneEntity, VisibleComponent, true)
    const material = getComponent(
      UUIDComponent.getEntityByUUID(getState(SelectionState).selectedEntities[0]!, Layers.Authoring),
      MaterialStateComponent
    ).material
    if (!material) return
    setComponent(sceneEntity, MeshComponent, new Mesh(new SphereGeometry(5, 32, 32), material))
    setComponent(sceneEntity, EnvMapComponent, { type: 'Skybox', envMapIntensity: 2 })
    const pivot = computeTransformPivot([sceneEntity], TransformPivot.Center, TransformSpace.world)
    if (!pivot?.position) return
    CameraOrbitComponent.setFocus(cameraEntity, pivot.position, pivot.bounds)
  }, [
    selectedMaterial,
    useComponent(UUIDComponent.getEntityByUUID(selectedMaterial.value!, Layers.Authoring), MaterialStateComponent)
      .material
  ])
  return (
    <>
      <div id="materialPreview" style={{ minHeight: '200px', width: '100%', height: '100%' }}>
        <canvas id="material-preview-canvas" ref={panelRef} style={{ pointerEvents: 'all' }} />
      </div>
    </>
  )
}

export const MaterialPreviewPanel = (props) => {
  const selectedMaterial = useMutableState(SelectionState).selectedEntities[0]
  if (!selectedMaterial.value) return null
  return <MaterialPreviewCanvas key={selectedMaterial.value} />
}
