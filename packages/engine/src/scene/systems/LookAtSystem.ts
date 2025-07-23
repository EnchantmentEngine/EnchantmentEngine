import { defineQuery, defineSystem, getComponent, UUIDComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial/src/ReferenceSpaceState'
import { Vector3_Up, Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { TransformDirtyUpdateSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { Matrix4, Quaternion, Vector3 } from 'three'
import { LookAtComponent } from '../components/LookAtComponent'

const facerQuery = defineQuery([LookAtComponent, TransformComponent])
const _srcPosition = new Vector3()
const _dstPosition = new Vector3()
const _direction = new Vector3()
const _zero = Vector3_Zero.clone()
const _up = Vector3_Up.clone()
const _lookMatrix = new Matrix4()
const _lookRotation = new Quaternion()

export const LookAtSystem = defineSystem({
  uuid: 'ir.spatial.LookAtSystem',
  insert: { before: TransformDirtyUpdateSystem },
  execute: () => {
    const viewerEntity = getState(ReferenceSpaceState).viewerEntity
    if (!viewerEntity) return

    for (const entity of facerQuery()) {
      const facer = getComponent(entity, LookAtComponent)
      const targetEntity = facer.target ? UUIDComponent.getEntityFromSameSourceByID(entity, facer.target) : viewerEntity
      if (!targetEntity) continue
      TransformComponent.getWorldPosition(entity, _srcPosition)
      TransformComponent.getWorldPosition(targetEntity, _dstPosition)
      _direction.subVectors(_dstPosition, _srcPosition).normalize()
      // look at target about enabled axes
      if (!facer.xAxis) {
        _direction.y = 0
      }
      if (!facer.yAxis) {
        _direction.x = 0
      }
      _lookMatrix.lookAt(_zero, _direction, _up)
      _lookRotation.setFromRotationMatrix(_lookMatrix)
      TransformComponent.setWorldRotation(entity, _lookRotation)
      TransformComponent.updateFromWorldMatrix(entity)
    }
  }
})
