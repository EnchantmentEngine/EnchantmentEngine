import { AnimationClip, AnimationMixer, Object3D, Vector3 } from 'three'

import {
  createEntity,
  EngineState,
  Entity,
  EntityTreeComponent,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  NetworkObjectComponent,
  NetworkObjectSendPeriodicUpdatesTag,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { setTargetCameraRotation } from '@ir-engine/spatial/src/camera/functions/CameraFunctions'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { AvatarCollisionMask, CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes, Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import {
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { getState, isClient } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { GrabberComponent } from '../../grabbable/GrabbableComponent'
import { EnvMapComponent } from '../../scene/components/EnvmapComponent'
import { ShadowComponent } from '../../scene/components/ShadowComponent'
import { EnvMapSourceType } from '../../scene/constants/EnvMapEnum'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarColliderComponent, AvatarControllerComponent, eyeOffset } from '../components/AvatarControllerComponent'
import { AvatarIKComponent } from '../components/AvatarIKComponents'

export const spawnAvatarReceptor = (entityUUID: EntityUUID) => {
  const entity = UUIDComponent.getEntityByUUID(entityUUID)
  if (!entity) return

  const ownerID = getComponent(entity, NetworkObjectComponent).ownerId
  setComponent(entity, TransformComponent)

  setComponent(entity, DistanceFromCameraComponent)
  setComponent(entity, FrustumCullCameraComponent)

  setComponent(entity, EnvMapComponent, {
    type: EnvMapSourceType.Skybox,
    envMapIntensity: 1
  })

  setComponent(entity, AnimationComponent, {
    mixer: new AnimationMixer(new Object3D()),
    animations: [] as AnimationClip[]
  })

  setComponent(entity, AvatarAnimationComponent, {
    locomotion: new Vector3()
  })

  setComponent(entity, AvatarComponent)
  ObjectLayerMaskComponent.setLayer(entity, ObjectLayers.Avatar)

  createAvatarCollider(entity)
  setAvatarColliderTransform(entity)

  setComponent(entity, RigidBodyComponent, {
    type: BodyTypes.Kinematic,
    allowRolling: false,
    enabledRotations: [false, true, false]
  })

  if (ownerID === getState(EngineState).userID) {
    createAvatarController(entity)
  }

  setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

  setComponent(entity, ShadowComponent)
  setComponent(entity, GrabberComponent)
  if (isClient) {
    setComponent(entity, AvatarRigComponent)
  }
  setComponent(entity, AvatarIKComponent)

  setComponent(entity, InputComponent)
}

export const createAvatarCollider = (entity: Entity) => {
  const colliderEntity = createEntity()
  setComponent(entity, AvatarColliderComponent, { colliderEntity })

  setComponent(colliderEntity, EntityTreeComponent, { parentEntity: entity })
  setComponent(colliderEntity, ColliderComponent, {
    shape: Shapes.Capsule,
    collisionLayer: CollisionGroups.Avatars,
    collisionMask: AvatarCollisionMask,
    matchMesh: false
  })
}

const avatarCapsuleOffset = 0.125
export const setAvatarColliderTransform = (entity: Entity) => {
  const avatarCollider = getOptionalComponent(entity, AvatarColliderComponent)
  if (!avatarCollider) {
    return
  }
  const colliderEntity = avatarCollider.colliderEntity
  const camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
  const avatarRadius = eyeOffset + camera.near
  const avatarComponent = getComponent(entity, AvatarComponent)
  const halfHeight = avatarComponent.avatarHeight * 0.5

  setComponent(colliderEntity, TransformComponent, {
    position: new Vector3(0, halfHeight + avatarCapsuleOffset, 0),
    scale: new Vector3(avatarRadius, halfHeight - avatarRadius - avatarCapsuleOffset, avatarRadius)
  })
}

export const createAvatarController = (entity: Entity) => {
  const transform = getComponent(entity, TransformComponent)

  const avatarForward = new Vector3(0, 0, 1).applyQuaternion(transform.rotation)
  const cameraForward = new Vector3(0, 0, -1)
  let targetTheta = (cameraForward.angleTo(avatarForward) * 180) / Math.PI
  const orientation = cameraForward.x * avatarForward.z - cameraForward.z * avatarForward.x
  if (orientation > 0) targetTheta = 2 * Math.PI - targetTheta
  setTargetCameraRotation(getState(ReferenceSpaceState).viewerEntity, 0, targetTheta, 0.01)

  setComponent(entity, AvatarControllerComponent)
}
