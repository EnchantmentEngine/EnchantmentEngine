import { useEffect } from 'react'
import { Vector3 } from 'three'

import { entityExists, removeEntity, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useHasComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { getState, useImmediateEffect } from '@ir-engine/hyperflux'
import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@ir-engine/spatial/src/camera/components/TargetCameraRotationComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { EntitySchema } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { CameraComponent } from '../../../../spatial/src/camera/components/CameraComponent'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { AvatarComponent } from './AvatarComponent'

export const eyeOffset = 0.25

export const AvatarControllerComponent = defineComponent({
  name: 'AvatarControllerComponent',

  schema: Schema.Object({
    /** The camera entity that should be updated by this controller */
    cameraEntity: EntitySchema.Entity(),
    movementCaptured: Schema.Array(EntitySchema.Entity()),
    isJumping: Schema.Bool(),
    isWalking: Schema.Bool(),
    isInAir: Schema.Bool(),
    /** velocity along the Y axis */
    verticalVelocity: Schema.Number(),
    /** Is the gamepad-driven jump active */
    gamepadJumpActive: Schema.Bool(),
    /** gamepad-driven input, in the local XZ plane */
    gamepadLocalInput: T.Vec3(),
    /** gamepad-driven movement, in the world XZ plane */
    gamepadWorldMovement: T.Vec3()
  }),

  captureMovement(capturedEntity: Entity, entity: Entity): void {
    const component = getComponent(capturedEntity, AvatarControllerComponent)
    if (component.movementCaptured.indexOf(entity) !== -1) return
    component.movementCaptured.push(entity)
  },

  releaseMovement(capturedEntity: Entity, entity: Entity): void {
    const component = getComponent(capturedEntity, AvatarControllerComponent)
    const index = component.movementCaptured.indexOf(entity)
    if (index !== -1) component.movementCaptured.splice(index, 1)
  },

  reactor: () => {
    const entity = useEntityContext()
    const avatarComponent = useOptionalComponent(entity, AvatarComponent)
    const avatarControllerComponent = useComponent(entity, AvatarControllerComponent)
    const isCameraAttachedToAvatar = XRState.useCameraAttachedToAvatar()
    const camera = useComponent(Engine.instance.cameraEntity, CameraComponent)
    const world = Physics.useWorld(entity)
    const gltfComponent = useOptionalComponent(entity, GLTFComponent)
    const cameraHasTargetRotation = useHasComponent(
      avatarControllerComponent.cameraEntity,
      TargetCameraRotationComponent
    )

    useImmediateEffect(() => {
      setComponent(entity, AvatarControllerComponent, {
        cameraEntity: getState(ReferenceSpaceState).viewerEntity || UndefinedEntity
      })
    }, [])

    useEffect(() => {
      if (!gltfComponent) return

      if (gltfComponent.progress !== 100) {
        AvatarControllerComponent.captureMovement(entity, entity)
      } else {
        AvatarControllerComponent.releaseMovement(entity, entity)
      }
    }, [gltfComponent?.progress])

    useEffect(() => {
      if (!world) return
      Physics.createCharacterController(world, entity, {})
      world.cameraAttachedRigidbodyEntity = entity
      return () => {
        world.cameraAttachedRigidbodyEntity = UndefinedEntity
        Physics.removeCharacterController(world, entity)
      }
    }, [world])

    useEffect(() => {
      if (!avatarComponent) return
      const cameraEntity = avatarControllerComponent.cameraEntity
      if (cameraEntity && entityExists(cameraEntity) && hasComponent(cameraEntity, FollowCameraComponent)) {
        const cameraComponent = getComponent(cameraEntity, FollowCameraComponent)
        cameraComponent.firstPersonOffset.set(0, avatarComponent.eyeHeight, eyeOffset)
        cameraComponent.thirdPersonOffset.set(0, avatarComponent.eyeHeight, 0)
      }
    }, [avatarComponent?.avatarHeight, camera.near])

    useEffect(() => {
      if (!avatarComponent || isCameraAttachedToAvatar || !cameraHasTargetRotation) return

      const controller = getComponent(entity, AvatarControllerComponent)
      const targetCameraRotation = getComponent(controller.cameraEntity, TargetCameraRotationComponent)
      setComponent(controller.cameraEntity, FollowCameraComponent, {
        targetEntity: entity,
        phi: targetCameraRotation.phi,
        theta: targetCameraRotation.theta,
        firstPersonOffset: new Vector3(0, avatarComponent.eyeHeight, eyeOffset),
        thirdPersonOffset: new Vector3(0, avatarComponent.eyeHeight, 0)
      })

      return () => {
        if (entityExists(controller.cameraEntity)) removeComponent(controller.cameraEntity, FollowCameraComponent)
      }
    }, [isCameraAttachedToAvatar, avatarComponent, cameraHasTargetRotation])

    return null
  }
})

export const AvatarColliderComponent = defineComponent({
  name: 'AvatarColliderComponent',
  schema: Schema.Object({ colliderEntity: EntitySchema.Entity() }),

  reactor({ entity }) {
    useEffect(() => {
      const avatarColliderComponent = getOptionalComponent(entity, AvatarColliderComponent)
      return () => {
        if (!avatarColliderComponent?.colliderEntity) return
        removeEntity(avatarColliderComponent.colliderEntity)
      }
    }, [])
  }
})
