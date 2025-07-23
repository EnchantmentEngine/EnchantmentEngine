import { PresentationSystemGroup } from '@ir-engine/ecs'
import { getComponent, getMutableComponent, getOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getState } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { getAncestorWithComponents } from '@ir-engine/ecs'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { Matrix4, Vector3 } from 'three'
import { SceneDynamicLoadComponent } from '../components/SceneDynamicLoadComponent'

const _cameraMat4 = new Matrix4()
const _sceneMat4 = new Matrix4()
const _cameraVec3 = new Vector3()
const _objVec3 = new Vector3()

let accumulator = 0

const distanceMultiplier = isMobile ? 0.5 : 1

const dynamicLoadQuery = defineQuery([SceneDynamicLoadComponent])

const execute = () => {
  accumulator += getState(ECSState).deltaSeconds

  if (accumulator < 1) {
    return
  }

  accumulator = 0

  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  const viewerTransform = getOptionalComponent(viewerEntity, TransformComponent)
  if (!viewerTransform) return
  const viewerWorldMatrix = viewerTransform.matrixWorld

  for (const entity of dynamicLoadQuery()) {
    const dynamicComponent = getComponent(entity, SceneDynamicLoadComponent)
    if (dynamicComponent.mode !== 'distance') continue

    const sceneEntity = getAncestorWithComponents(entity, [SceneComponent])
    _cameraMat4
      .copy(viewerWorldMatrix)
      .premultiply(_sceneMat4.copy(getComponent(sceneEntity, TransformComponent).matrixWorld).invert())

    _cameraVec3.set(_cameraMat4.elements[12], _cameraMat4.elements[13], _cameraMat4.elements[14])

    const objectPosition = TransformComponent.getScenePosition(entity, _objVec3)

    const distanceToAvatar = _cameraVec3.distanceToSquared(objectPosition)
    const loadDistance = dynamicComponent.distance * dynamicComponent.distance * distanceMultiplier

    getMutableComponent(entity, SceneDynamicLoadComponent).loaded.set(distanceToAvatar < loadDistance)
  }
}

export const SceneObjectDynamicLoadSystem = defineSystem({
  uuid: 'ee.engine.scene.SceneObjectDynamicLoadSystem',
  insert: { after: PresentationSystemGroup },
  execute
})
