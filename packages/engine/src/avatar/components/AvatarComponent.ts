import { EngineState, EntityID, NetworkObjectComponent, SourceID, UndefinedEntity, UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  useComponent,
  useHasComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { getState, Schema, useMutableState, UserID } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSettingsState'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { useEffect } from 'react'
import { setAvatarColliderTransform } from '../functions/spawnAvatarReceptor'

export const AvatarComponent = defineComponent({
  name: 'AvatarComponent',
  schema: Schema.Object({
    /** The total height of the avatar in a t-pose, must always be non zero and positive for the capsule collider */
    avatarHeight: Schema.Number(),
    /** The length of the torso in a t-pose, from the hip joint to the head joint */
    torsoLength: Schema.Number(),
    /** The length of the upper leg in a t-pose, from the hip joint to the knee joint */
    upperLegLength: Schema.Number(),
    /** The length of the lower leg in a t-pose, from the knee joint to the ankle joint */
    lowerLegLength: Schema.Number(),
    /** The height of the foot in a t-pose, from the ankle joint to the bottom of the avatar's model */
    footHeight: Schema.Number(),
    /** The height of the hips in a t-pose */
    hipsHeight: Schema.Number(),
    /** The length of the arm in a t-pose, from the shoulder joint to the elbow joint */
    armLength: Schema.Number(),
    /** The distance between the left and right foot in a t-pose */
    footGap: Schema.Number(),
    /** The angle of the foot in a t-pose */
    footAngle: Schema.Number(),
    /** The height of the eyes in a t-pose */
    eyeHeight: Schema.Number()
  }),

  /**
   * A unique entityID for avatars
   */
  entityID: 'avatar' as EntityID,

  /**
   * Get the sourceID for the user's avatar
   */
  getSelfSourceID() {
    return getState(EngineState).userID as any as SourceID
  },

  /**
   * Get the UUID for the user's avatar
   */
  getSelfAvatarUUID() {
    return UUIDComponent.join({
      entitySourceID: AvatarComponent.getSelfSourceID(),
      entityID: AvatarComponent.entityID
    })
  },

  /**
   * Get the avatar entity for a given user
   * @param userId
   * @returns
   */
  getUserAvatarEntity(userId: UserID) {
    return avatarNetworkObjectQuery().find((eid) => getComponent(eid, NetworkObjectComponent).ownerId === userId)!
  },

  /*
   * Get the active user's avatar entity
   */
  getSelfAvatarEntity() {
    return UUIDComponent.getEntityByUUID(AvatarComponent.getSelfAvatarUUID())
  },

  /**
   * Reactively get the active user's avatar entity
   */
  useSelfAvatarEntity() {
    return UUIDComponent.useEntityByUUID(AvatarComponent.getSelfAvatarUUID())
  },

  reactor: ({ entity }) => {
    const camera = useOptionalComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent)
    const avatarComponent = useComponent(entity, AvatarComponent)
    const cameraSettingsState = useMutableState(CameraSettingsState)
    const selfAvatarEntity = AvatarComponent.useSelfAvatarEntity()
    const hasVisibleComponent = useHasComponent(selfAvatarEntity, VisibleComponent)

    useEffect(() => {
      setAvatarColliderTransform(entity)
    }, [avatarComponent?.avatarHeight, camera?.near])

    useEffect(() => {
      if (selfAvatarEntity === UndefinedEntity) return
      if (hasVisibleComponent === cameraSettingsState.isAvatarVisible.value) return
      setVisibleComponent(selfAvatarEntity, cameraSettingsState.isAvatarVisible.value)
    }, [hasVisibleComponent, selfAvatarEntity, cameraSettingsState.isAvatarVisible])

    return null
  }
})

const avatarNetworkObjectQuery = defineQuery([NetworkObjectComponent, AvatarComponent])
