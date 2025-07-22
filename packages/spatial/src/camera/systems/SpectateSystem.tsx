import React, { useEffect } from 'react'
import { MathUtils } from 'three'

import {
  Engine,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  matchesEntityID,
  removeComponent,
  setComponent,
  UUIDComponent,
  WorldNetworkAction
} from '@ir-engine/ecs'
import {
  defineAction,
  defineState,
  getMutableState,
  getState,
  matchesUserID,
  NetworkTopics,
  none,
  useHookstate,
  useMutableState,
  UserID
} from '@ir-engine/hyperflux'

import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { FlyControlComponent } from '../components/FlyControlComponent'

export class SpectateActions {
  static spectateEntity = defineAction({
    type: 'ee.engine.Engine.SPECTATE_USER' as const,
    spectatorUserID: matchesUserID,
    spectatingEntity: matchesEntityID.optional(),
    $topic: NetworkTopics.world
  })

  static exitSpectate = defineAction({
    type: 'ee.engine.Engine.EXIT_SPECTATE' as const,
    spectatorUserID: matchesUserID,
    $topic: NetworkTopics.world
  })
}

export const SpectateEntityState = defineState({
  name: 'SpectateEntityState',
  initial: {} as Record<UserID, { spectating?: EntityUUID }>,

  receptors: {
    onSpectateUser: SpectateActions.spectateEntity.receive((action) => {
      getMutableState(SpectateEntityState)[action.spectatorUserID].set({
        spectating: action.spectatingEntity as EntityUUID | undefined
      })
    }),
    onEntityDestroy: WorldNetworkAction.destroyEntity.receive((action) => {
      if (getState(SpectateEntityState)[action.entityUUID]) {
        getMutableState(SpectateEntityState)[action.entityUUID].set(none)
      }
      for (const spectatorUserID in getState(SpectateEntityState)) {
        if (getState(SpectateEntityState)[spectatorUserID].spectating === action.entityUUID) {
          getMutableState(SpectateEntityState)[spectatorUserID].set(none)
        }
      }
    }),
    onExitSpectate: SpectateActions.exitSpectate.receive((action) => {
      getMutableState(SpectateEntityState)[action.spectatorUserID].set(none)
    })
  },

  reactor: () => {
    const state = useMutableState(SpectateEntityState)

    if (!state.value[Engine.instance.userID]) return null

    return <SpectatorReactor />
  }
})

const SpectatorReactor = () => {
  const state = useHookstate(getMutableState(SpectateEntityState)[Engine.instance.userID])

  useEffect(() => {
    const cameraEntity = getState(ReferenceSpaceState).viewerEntity

    if (!state.spectating.value) {
      setComponent(cameraEntity, FlyControlComponent, {
        boostSpeed: 4,
        moveSpeed: 4,
        lookSensitivity: 5,
        maxXRotation: MathUtils.degToRad(80)
      })
      return () => {
        removeComponent(cameraEntity, FlyControlComponent)
      }
    }
  }, [state.spectating])

  if (!state.spectating.value) return null

  return <SpectatingUserReactor key={state.spectating.value} entityUUID={state.spectating.value} />
}

const SpectatingUserReactor = (props: { entityUUID: EntityUUID }) => {
  const spectateEntity = UUIDComponent.useEntityByUUID((props.entityUUID + '_camera') as EntityUUID)

  useEffect(() => {
    if (!spectateEntity) return

    const cameraEntity = getState(ReferenceSpaceState).viewerEntity
    const cameraTransform = getComponent(cameraEntity, TransformComponent)
    setComponent(cameraEntity, ComputedTransformComponent, {
      referenceEntities: [spectateEntity],
      computeFunction: () => {
        const networkTransform = getOptionalComponent(spectateEntity, TransformComponent)
        if (!networkTransform) return
        cameraTransform.position.copy(networkTransform.position)
        cameraTransform.rotation.copy(networkTransform.rotation)
      }
    })
    return () => {
      removeComponent(cameraEntity, ComputedTransformComponent)
    }
  }, [spectateEntity])

  return null
}
