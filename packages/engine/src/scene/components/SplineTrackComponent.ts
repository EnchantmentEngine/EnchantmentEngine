import { useEffect } from 'react'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

import { EntitySchema, EntityTreeComponent, useEntityContext, UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getAuthoringCounterpart,
  getComponent,
  getOptionalComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { Schema } from '@ir-engine/hyperflux'
import { PhysicsSystem } from '@ir-engine/spatial/src/physics/systems/PhysicsSystem'
import { SplineComponent } from './SplineComponent'

const _euler = new Euler()
const _quat = new Quaternion()

const _point1Vector = new Vector3()

export const SplineTrackComponent = defineComponent({
  name: 'SplineTrackComponent',
  jsonID: 'EE_spline_track',

  schema: Schema.Object({
    splineEntityUUID: EntitySchema.EntityID(),
    velocity: Schema.Number({ default: 1.0 }),
    enableRotation: Schema.Bool({ default: false }),
    lockToXZPlane: Schema.Bool({ default: true }),
    loop: Schema.Bool({ default: true }),

    // internal
    alpha: Schema.Number({ default: 0, serialized: false })
  }),

  reactor: function (props) {
    const entity = useEntityContext()
    const componentState = useComponent(entity, SplineTrackComponent)

    useExecute(
      () => {
        if (getAuthoringCounterpart(entity)) return
        const { deltaSeconds } = getState(ECSState)
        const component = getComponent(entity, SplineTrackComponent)
        if (!component.splineEntityUUID) return
        const splineTargetEntity = UUIDComponent.getEntityFromSameSourceByID(entity, component.splineEntityUUID)
        if (!splineTargetEntity) return

        const splineComponent = getOptionalComponent(splineTargetEntity, SplineComponent)
        if (!splineComponent) return

        // get local transform for this entity
        const transform = getOptionalComponent(entity, TransformComponent)
        if (!transform) return

        const elements = splineComponent.elements
        if (elements.length < 1) return

        if (Math.floor(component.alpha) > elements.length - 1) {
          if (!component.loop) {
            //emit an event here?
            return
          }
          component.alpha = 0
        }
        component.alpha = component.alpha + (deltaSeconds * component.velocity) / splineComponent.curve.getLength() // todo cache length to avoid recalculating every frame

        // move along spline
        const alpha = component.alpha
        const index = Math.floor(component.alpha)
        const nextIndex = index + 1 > elements.length - 1 ? 0 : index + 1

        // prevent a possible loop around hiccup; if no loop then do not permit modulo 0
        if (!component.loop && index > nextIndex) return

        const splineTransform = getComponent(splineTargetEntity, TransformComponent)

        // translation
        splineComponent.curve.getPointAt(alpha - index, _point1Vector)
        transform.position.copy(_point1Vector)

        // rotation
        const q1 = elements[index].rotation
        const q2 = elements[nextIndex].rotation

        if (component.enableRotation) {
          if (component.lockToXZPlane) {
            // get X and Y rotation only
            _euler.setFromQuaternion(q1)
            _euler.z = 0

            transform.rotation.setFromEuler(_euler)

            _euler.setFromQuaternion(q2)
            _euler.z = 0

            _quat.setFromEuler(_euler)

            transform.rotation.fastSlerp(_quat, alpha - index)
          } else {
            transform.rotation.copy(q1).fastSlerp(q2, alpha - index)
          }
        }

        /** @todo optimize this */
        transform.matrix.compose(transform.position, transform.rotation, transform.scale)
        // apply spline transform
        transform.matrix.premultiply(splineTransform.matrix)
        transform.matrix.decompose(transform.position, transform.rotation, transform.scale)

        // update local transform for target
        const parentEntity = getComponent(entity, EntityTreeComponent).parentEntity
        if (!parentEntity) return
        const parentTransform = getComponent(parentEntity, TransformComponent)
        transform.matrix
          .premultiply(mat4.copy(parentTransform.matrixWorld).invert())
          .decompose(transform.position, transform.rotation, transform.scale)
      },
      { before: PhysicsSystem }
    )

    useEffect(() => {
      if (!componentState.splineEntityUUID) return
      const splineTargetEntity = UUIDComponent.getEntityFromSameSourceByID(entity, componentState.splineEntityUUID)
      if (!splineTargetEntity) return
      const splineComponent = getOptionalComponent(splineTargetEntity, SplineComponent)
      if (!splineComponent) return
      splineComponent.curve.closed = componentState.loop
    }, [componentState.loop])

    return null
  }
})

const mat4 = new Matrix4()
