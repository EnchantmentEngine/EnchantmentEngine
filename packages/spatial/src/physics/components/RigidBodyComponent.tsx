import { Entity, S, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'

import React, { useEffect } from 'react'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import { Physics } from '../classes/Physics'
import { Body, BodyTypes } from '../types/PhysicsTypes'

import { createResizableTypeArray } from '@ir-engine/ecs/src/bitecsLegacy'
import { Quaternion, Vector3 } from 'three'
import { T } from '../../schema/schemaFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'

const options = {
  deserialize: (curr, value) => curr.copy(value)
}

const assignVec3 = (property: string, entity: Entity): Vector3 => proxifyVector3(RigidBodyComponent[property], entity)

const assignQuat = (property: string, entity: Entity): Quaternion =>
  proxifyQuaternion(RigidBodyComponent[property], entity)

export const RigidBodyComponent = defineComponent({
  name: 'RigidBodyComponent',
  jsonID: 'EE_rigidbody',
  schema: S.Object({
    type: S.Enum(BodyTypes, {
      $comment: "A string enum, ie. one of the following values: 'fixed', 'dynamic', 'kinematic'",
      default: BodyTypes.Fixed
    }),
    ccd: S.Bool({ default: false }),
    allowRolling: S.Bool({ default: true }),
    enabledRotations: S.Tuple([S.Bool(), S.Bool(), S.Bool()], { default: [true, true, true] }),
    // rigidbody desc values
    canSleep: S.Bool({ default: true }),
    gravityScale: S.Number({ default: 1 }),
    // internal
    /** @deprecated  @todo make the physics api properly reactive to remove this property  */
    initialized: S.Bool({ default: false, serialized: false }),
    previousPosition: T.Vec3(undefined, { serialized: false }),
    previousRotation: T.Quaternion(undefined, { serialized: false }),
    position: T.Vec3(undefined, { serialized: false }),
    rotation: T.Quaternion(undefined, { serialized: false }),
    targetKinematicPosition: T.Vec3(undefined, { serialized: false }),
    targetKinematicRotation: T.Quaternion(undefined, { serialized: false }),
    linearVelocity: T.Vec3(undefined, { serialized: false }),
    angularVelocity: T.Vec3(undefined, { serialized: false }),
    /** If multiplier is 0, ridigbody moves immediately to target pose, linearly interpolating between substeps */
    targetKinematicLerpMultiplier: S.Number({ default: 0, serialized: false })
  }),

  storage: {
    previousPosition: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array)
    },
    previousRotation: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array),
      w: createResizableTypeArray(Float64Array)
    },
    position: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array)
    },
    rotation: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array),
      w: createResizableTypeArray(Float64Array)
    },
    targetKinematicPosition: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array)
    },
    targetKinematicRotation: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array),
      w: createResizableTypeArray(Float64Array)
    },
    linearVelocity: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array)
    },
    angularVelocity: {
      x: createResizableTypeArray(Float64Array),
      y: createResizableTypeArray(Float64Array),
      z: createResizableTypeArray(Float64Array)
    }
  },

  onInit(entity, initial) {
    initial.previousPosition = assignVec3('previousPosition', entity)
    initial.previousRotation = assignQuat('previousRotation', entity)
    initial.position = assignVec3('position', entity)
    initial.rotation = assignQuat('rotation', entity)
    initial.targetKinematicPosition = assignVec3('targetKinematicPosition', entity)
    initial.targetKinematicRotation = assignQuat('targetKinematicRotation', entity)
    initial.linearVelocity = assignVec3('linearVelocity', entity)
    initial.angularVelocity = assignVec3('angularVelocity', entity)
    return initial
  },

  reactor: () => {
    return <RigidBodyReactor />
  }
})

const RigidBodyReactor = () => {
  const entity = useEntityContext()
  const component = useComponent(entity, RigidBodyComponent)
  const physicsWorld = Physics.useWorld(entity)!

  useEffect(() => {
    if (!component.initialized.value) return
    TransformComponent.dirty[entity] = 1
  }, [component.initialized.value])

  useEffect(() => {
    if (!physicsWorld) return
    Physics.createRigidBody(physicsWorld, entity)
    component.initialized.set(true)
    return () => {
      Physics.removeRigidbody(physicsWorld, entity)
      if (!hasComponent(entity, RigidBodyComponent)) return
      getMutableComponent(entity, RigidBodyComponent).initialized.set(false)
    }
  }, [physicsWorld])

  useEffect(() => {
    if (!physicsWorld) return
    const type = component.type.value
    setComponent(entity, getTagComponentForRigidBody(type))
    Physics.setRigidBodyType(physicsWorld, entity, type)
    return () => {
      removeComponent(entity, getTagComponentForRigidBody(type))
    }
  }, [physicsWorld, component.type])

  useEffect(() => {
    if (!physicsWorld) return
    Physics.enabledCcd(physicsWorld, entity, component.ccd.value)
  }, [physicsWorld, component.ccd])

  useEffect(() => {
    if (!physicsWorld) return
    const value = component.allowRolling.value
    /**
     * @todo Change this back to `Physics.lockRotations( entity, !value )` when we update to Rapier >= 0.12.0
     * https://github.com/dimforge/rapier.js/issues/282  */
    Physics.setEnabledRotations(physicsWorld, entity, [value, value, value])
  }, [component.allowRolling.value])

  useEffect(() => {
    if (!physicsWorld) return
    Physics.setEnabledRotations(physicsWorld, entity, component.enabledRotations.value as [boolean, boolean, boolean])
  }, [component.enabledRotations[0].value, component.enabledRotations[1].value, component.enabledRotations[2].value])

  return null
}

export const RigidBodyDynamicTagComponent = defineComponent({ name: 'RigidBodyDynamicTagComponent' })
export const RigidBodyFixedTagComponent = defineComponent({ name: 'RigidBodyFixedTagComponent' })
export const RigidBodyKinematicTagComponent = defineComponent({ name: 'RigidBodyKinematicTagComponent' })

type RigidBodyTypes =
  | typeof RigidBodyDynamicTagComponent
  | typeof RigidBodyFixedTagComponent
  | typeof RigidBodyKinematicTagComponent

export const getTagComponentForRigidBody = (type: Body): RigidBodyTypes => {
  switch (type) {
    case BodyTypes.Dynamic:
      return RigidBodyDynamicTagComponent
    case BodyTypes.Fixed:
      return RigidBodyFixedTagComponent
    case BodyTypes.Kinematic:
      return RigidBodyKinematicTagComponent
  }
}
