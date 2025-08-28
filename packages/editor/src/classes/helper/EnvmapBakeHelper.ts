import {
  createEntity,
  EntityTreeComponent,
  getComponent,
  removeEntity,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { EnvMapBakeComponent } from '@ir-engine/engine/src/scene/components/EnvMapBakeComponent'
import { TransformComponent } from '@ir-engine/spatial'
import { useHelperEntity } from '@ir-engine/spatial/src/helper/functions/useHelperEntity'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { useEffect } from 'react'
import { Box3, Box3Helper, Mesh, MeshPhysicalMaterial, SphereGeometry } from 'three'

const sphereGeometry = new SphereGeometry(0.75)
const helperMeshMaterial = new MeshPhysicalMaterial({ roughness: 0, metalness: 1 })

export const EnvmapBakeHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const debugEnabled = selected || hovered
  useHelperEntity(parentEntity, () => new Mesh(sphereGeometry, helperMeshMaterial), debugEnabled)

  const bakeComponent = useComponent(parentEntity, EnvMapBakeComponent)
  const transformComponent = useOptionalComponent(parentEntity, TransformComponent)

  // Box projection visual helper
  useEffect(() => {
    if (!debugEnabled || !bakeComponent.boxProjection || !transformComponent) return

    const boxProjectionHelper = new Box3Helper(new Box3(), 'cyan')
    const boundsHelperEntity = createEntity()
    setComponent(boundsHelperEntity, ObjectComponent, boxProjectionHelper)
    setComponent(boundsHelperEntity, TransformComponent)
    setComponent(boundsHelperEntity, EntityTreeComponent, { parentEntity: parentEntity })
    setComponent(boundsHelperEntity, VisibleComponent)
    ObjectLayerMaskComponent.setLayer(boundsHelperEntity, ObjectLayers.NodeHelper)

    const helperTransform = getComponent(boundsHelperEntity, TransformComponent)
    helperTransform.position.copy(bakeComponent.bakePositionOffset)
    boxProjectionHelper.box.setFromCenterAndSize(bakeComponent.bakePositionOffset, bakeComponent.bakeScale)
    boxProjectionHelper.updateMatrixWorld(true)

    return () => {
      removeEntity(boundsHelperEntity)
    }
  }, [
    debugEnabled,
    bakeComponent.boxProjection,
    bakeComponent.bakePositionOffset,
    bakeComponent.bakeScale,
    transformComponent?.position
  ])
  return null
}
