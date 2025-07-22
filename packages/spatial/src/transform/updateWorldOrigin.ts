import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { getState } from '@ir-engine/hyperflux'

import { EntityTreeComponent } from '@ir-engine/ecs'
import { ReferenceSpaceState } from '../ReferenceSpaceState'
import { Vector3_One } from '../common/constants/MathConstants'
import { ReferenceSpace, XRState } from '../xr/XRState'
import { TransformComponent } from './components/TransformComponent'

// TODO: only update the world origin in one place; move logic for moving based on viewer hit into the function above
export const updateWorldOriginFromScenePlacement = () => {
  const xrState = getState(XRState)
  const scenePosition = xrState.scenePosition
  const sceneRotation = xrState.sceneRotation
  const worldScale = XRState.worldScale
  const originTransform = getComponent(getState(ReferenceSpaceState).localFloorEntity, TransformComponent)
  originTransform.position.copy(scenePosition)
  originTransform.rotation.copy(sceneRotation)
  const children = getComponent(getState(ReferenceSpaceState).originEntity, EntityTreeComponent).children
  for (const child of children) {
    const childTransform = getComponent(child, TransformComponent)
    childTransform.scale.setScalar(worldScale)
  }
  originTransform.matrix.compose(originTransform.position, originTransform.rotation, Vector3_One).invert()
  originTransform.matrixWorld.copy(originTransform.matrix)
  originTransform.matrixWorld.decompose(originTransform.position, originTransform.rotation, originTransform.scale)
  if (ReferenceSpace.localFloor) {
    const xrRigidTransform = new XRRigidTransform(scenePosition, sceneRotation)
    ReferenceSpace.origin = ReferenceSpace.localFloor.getOffsetReferenceSpace(xrRigidTransform)
  }
}

export const updateWorldOrigin = () => {
  if (ReferenceSpace.localFloor) {
    const originTransform = getComponent(getState(ReferenceSpaceState).localFloorEntity, TransformComponent)
    const xrRigidTransform = new XRRigidTransform(originTransform.position, originTransform.rotation)
    ReferenceSpace.origin = ReferenceSpace.localFloor.getOffsetReferenceSpace(xrRigidTransform.inverse)
  }
}

export const computeAndUpdateWorldOrigin = () => {
  // Use TransformComponent's computeTransformMatrix method
  TransformComponent.computeTransformMatrix(getState(ReferenceSpaceState).localFloorEntity)
  updateWorldOrigin()
}
