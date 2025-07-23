import { useRender3DPanelSystem } from '@ir-engine/client-core/src/hooks/useRender3DPanelSystem'
import {
  createEntity,
  EntityID,
  EntityTreeComponent,
  removeComponent,
  setComponent,
  SourceID,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { AmbientLightComponent, TransformComponent } from '@ir-engine/spatial'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import React, { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { CameraGizmoComponent } from '../../../classes/gizmo/camera/CameraGizmoComponent'

export default function CameraGizmoTool({
  viewportRef,
  toolbarRef
}: {
  viewportRef: React.RefObject<HTMLDivElement>
  toolbarRef: React.RefObject<HTMLDivElement>
}) {
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const cameraGizmoRenderPanel = useRender3DPanelSystem(panelRef)

  useEffect(() => {
    const { sceneEntity, cameraEntity } = cameraGizmoRenderPanel

    const uuid = {
      entitySourceID: 'detatched' as SourceID,
      entityID: 'camera-gizmo' as EntityID
    }
    setComponent(sceneEntity, UUIDComponent, uuid)
    setComponent(sceneEntity, NameComponent, 'Camera Gizmo Scene')
    setComponent(sceneEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(sceneEntity, VisibleComponent, true)
    setComponent(sceneEntity, CameraGizmoComponent, { sceneEntity: sceneEntity, cameraEntity: cameraEntity })
    removeComponent(cameraEntity, CameraOrbitComponent)
    setComponent(cameraEntity, TransformComponent, { position: new Vector3(0, 0, 2) })

    const lightEntity = createEntity()
    setComponent(lightEntity, AmbientLightComponent)
    setComponent(lightEntity, TransformComponent)
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, NameComponent, 'Ambient Light')
    setComponent(lightEntity, EntityTreeComponent, { parentEntity: sceneEntity })
  }, [])

  return (
    <div className="z-20 ml-auto h-20 w-20 ">
      <canvas id="camera-gizmo-tool" ref={panelRef} style={{ pointerEvents: 'all' }} />
    </div>
  )
}
