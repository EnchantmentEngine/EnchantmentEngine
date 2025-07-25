import {
  defineComponent,
  hasComponent,
  setComponent,
  useComponent,
  useHasComponent,
  useOptionalComponent
} from '@ir-engine/ecs'

import { useAncestorWithComponents } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useEffect, useLayoutEffect } from 'react'
import { removeCallback, setCallback } from '../../common/CallbackComponent'
import { Vector3_One } from '../../common/constants/MathConstants'
import { T } from '../../schema/schemaFunctions'
import { Physics } from '../classes/Physics'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'
import { ShapeSchema, Shapes } from '../types/PhysicsTypes'
import { RigidBodyComponent } from './RigidBodyComponent'
import { TriggerComponent } from './TriggerComponent'

export const ColliderComponent = defineComponent({
  name: 'ColliderComponent',
  jsonID: 'EE_collider',

  schema: S.Object({
    shape: ShapeSchema('box'),
    mass: S.Number({ default: 1 }),
    massCenter: T.Vec3(),
    friction: S.Number({ default: 0.5 }),
    restitution: S.Number({ default: 0.5 }),
    collisionLayer: S.Enum(CollisionGroups, {
      $comment:
        "A bitmask, ie. an integer whose binary digits, in order of least to most significance, represent the following values: 'Default', 'Avatars', 'Ground', 'Trigger'",
      default: CollisionGroups.Default
    }),
    collisionMask: S.Number({ default: DefaultCollisionMask }),
    hasCollider: S.Bool({ default: false, serialized: false }),
    //shape specific parameters
    matchMesh: S.Bool({ default: true }),
    centerOffset: T.Vec3(),
    boxSize: T.Vec3(Vector3_One),
    radius: S.Number({ default: 1 }),
    height: S.Number({ default: 2 })
  }),

  reactor: ({ entity }) => {
    const component = useComponent(entity, ColliderComponent)
    const rigidbodyEntity = useAncestorWithComponents(entity, [RigidBodyComponent])
    const rigidbodyComponent = useOptionalComponent(rigidbodyEntity, RigidBodyComponent)
    const physicsWorld = Physics.useWorld(entity)
    const triggerComponent = useHasComponent(entity, TriggerComponent)

    useLayoutEffect(() => {
      if (!rigidbodyComponent?.initialized || !physicsWorld) return

      const colliderDesc = Physics.createColliderDesc(physicsWorld, entity, rigidbodyEntity)

      if (!colliderDesc) return

      Physics.attachCollider(physicsWorld, colliderDesc, rigidbodyEntity, entity)
      setComponent(entity, ColliderComponent, { hasCollider: true })

      return () => {
        if (hasComponent(entity, ColliderComponent)) {
          setComponent(entity, ColliderComponent, { hasCollider: false })
        }
        if (!physicsWorld) return
        Physics.removeCollider(physicsWorld, entity)
      }
    }, [
      !!physicsWorld,
      component.shape,
      rigidbodyComponent?.initialized,
      component.centerOffset.x,
      component.centerOffset.y,
      component.centerOffset.z,
      component.boxSize.x,
      component.boxSize.y,
      component.boxSize.z,
      component.radius,
      component.height
    ])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setMass(physicsWorld, entity, component.mass)
    }, [physicsWorld, component.mass])

    // useLayoutEffect(() => {
    // @todo
    // }, [physicsWorld, component.massCenter])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setFriction(physicsWorld, entity, component.friction)
    }, [physicsWorld, component.friction])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setRestitution(physicsWorld, entity, component.restitution)
    }, [physicsWorld, component.restitution])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setCollisionLayer(physicsWorld, entity, component.collisionLayer)
    }, [physicsWorld, component.collisionLayer])

    useLayoutEffect(() => {
      if (!physicsWorld) return
      Physics.setCollisionMask(physicsWorld, entity, component.collisionMask)
    }, [physicsWorld, component.collisionMask])

    useLayoutEffect(() => {
      if (!physicsWorld || !triggerComponent || !component.hasCollider) return

      Physics.setTrigger(physicsWorld, entity, true)

      return () => {
        Physics.setTrigger(physicsWorld, entity, false)
      }
    }, [physicsWorld, triggerComponent, component.hasCollider])

    useEffect(() => {
      if (!physicsWorld) return

      setCallback(entity, 'Disable Collision', () => {
        if (!physicsWorld) return
        Physics.setCollisionLayer(physicsWorld, entity, CollisionGroups.None)
      })
      setCallback(entity, 'Enable Collision', () => {
        if (!physicsWorld) return
        Physics.setCollisionLayer(physicsWorld, entity, component.collisionLayer)
      })
      return () => {
        removeCallback(entity, 'Disable Collision')
        removeCallback(entity, 'Enable Collision')
      }
    }, [physicsWorld])

    return null
  }
})

export const supportedColliderShapes = [
  Shapes.Sphere,
  Shapes.Capsule,
  Shapes.Cylinder,
  Shapes.Box,
  // Shapes.ConvexHull,
  Shapes.Mesh
  // Shapes.Heightfield
]
