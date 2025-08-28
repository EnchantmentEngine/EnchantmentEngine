import {
  AnimationSystemGroup,
  Entity,
  EntityArrayBoundary,
  QueryReactor,
  defineQuery,
  defineSystem,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent,
  useQueryBySource
} from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { ReferenceSpaceState } from '@ir-engine/spatial'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import React, { useEffect } from 'react'
import {
  DitherCalculationType,
  TransparencyDitheringPluginComponent,
  TransparencyDitheringRootComponent
} from '../../material/plugins/TransparencyDitheringComponent'
import { AvatarComponent } from '../components/AvatarComponent'

const headDithering = 0
const cameraDithering = 1
const avatarQuery = defineQuery([AvatarComponent])

const execute = () => {
  const selfEntity = AvatarComponent.getSelfAvatarEntity()
  if (!selfEntity) return

  const cameraAttached = XRState.shouldViewerFollowController

  for (const avatarEntity of avatarQuery()) {
    const transparencyDitheringRoot = getOptionalComponent(avatarEntity, TransparencyDitheringRootComponent)
    const materials = transparencyDitheringRoot?.materials
    if (!materials) setComponent(avatarEntity, TransparencyDitheringRootComponent, { materials: [] })

    const avatarComponent = getComponent(avatarEntity, AvatarComponent)
    const cameraComponent = getOptionalComponent(getState(ReferenceSpaceState).viewerEntity, FollowCameraComponent)

    if (!materials?.length) continue
    for (const materialEntity of materials) {
      const pluginComponent = getOptionalComponent(materialEntity, TransparencyDitheringPluginComponent)
      if (!pluginComponent) continue
      const viewerPosition = getComponent(getState(ReferenceSpaceState).viewerEntity, TransformComponent).position
      pluginComponent.centers[cameraDithering].set(viewerPosition.x, viewerPosition.y, viewerPosition.z)
      pluginComponent.distances[cameraDithering] = cameraAttached ? 8 : 3
      pluginComponent.exponents[cameraDithering] = cameraAttached ? 10 : 6
      pluginComponent.useWorldCalculation[cameraDithering] = DitherCalculationType.worldTransformed
      if (avatarEntity !== selfEntity) {
        pluginComponent.distances[headDithering] = 10
        continue
      }
      pluginComponent.centers[headDithering].setY(avatarComponent.eyeHeight)
      pluginComponent.distances[headDithering] =
        cameraComponent && !cameraAttached ? Math.max(Math.pow(cameraComponent.distance * 5, 2.5), 3) : 3.5
      pluginComponent.exponents[headDithering] = cameraAttached ? 12 : 8
      pluginComponent.useWorldCalculation[headDithering] = DitherCalculationType.localPosition
    }
  }
}

export const AvatarTransparencySystem = defineSystem({
  uuid: 'AvatarTransparencySystem',
  insert: { with: AnimationSystemGroup },
  execute,
  reactor: () => <QueryReactor Components={[AvatarComponent]} ChildEntityReactor={AvatarReactor} />
})

const AvatarReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const materialChildren = useQueryBySource(entity, [MaterialStateComponent])
  const rootDitheringComponent = useOptionalComponent(entity, TransparencyDitheringRootComponent)
  if (!rootDitheringComponent) return null

  return (
    <EntityArrayBoundary
      entities={materialChildren}
      ChildEntityReactor={DitherChildReactor}
      props={{ rootEntity: entity }}
    />
  )
}

const DitherChildReactor = (props: { entity: Entity; rootEntity: Entity }) => {
  const entity = props.entity
  const material = useComponent(entity, MaterialStateComponent)

  useEffect(() => {
    getComponent(props.rootEntity, TransparencyDitheringRootComponent).materials.push(props.entity)
    setComponent(entity, TransparencyDitheringPluginComponent)
    return () => {
      if (hasComponent(props.rootEntity, TransparencyDitheringRootComponent)) {
        const ditherRootMaterials = getComponent(props.rootEntity, TransparencyDitheringRootComponent).materials
        const index = ditherRootMaterials.indexOf(props.entity)
        if (index >= 0) ditherRootMaterials.splice(index, 1)
      }
      removeComponent(entity, TransparencyDitheringPluginComponent)
    }
  }, [material])

  return null
}
