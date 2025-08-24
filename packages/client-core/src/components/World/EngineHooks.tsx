import { Suspense, useEffect } from 'react'

import multiLogger from '@ir-engine/common/src/logger'
import { InstanceID, projectsPath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs'
import {
  Network,
  NetworkActions,
  NetworkState,
  NetworkTopics,
  addOutgoingTopicIfNecessary,
  dispatchAction,
  getMutableState,
  joinNetwork,
  leaveNetwork,
  none,
  useHookstate,
  useImmediateEffect,
  useMutableState
} from '@ir-engine/hyperflux'
import { loadEngineInjection } from '@ir-engine/projects/loadEngineInjection'

import { useFind } from '@ir-engine/common'
import { EngineState } from '@ir-engine/ecs'
import React from 'react'
import { AuthState } from '../../user/services/AuthService'

const logger = multiLogger.child({ component: 'client-core:world' })

export const useEngineInjection = () => {
  const projects = useFind(projectsPath)
  const loaded = useHookstate(false)
  useImmediateEffect(() => {
    if (!projects.data.length) return
    loadEngineInjection(projects.data as string[])
      .then(() => {
        loaded.set(true)
      })
      .catch((e) => {
        loaded.set(true)
        logger.error('Failed to load engine injection', e)
      })
  }, [projects.data])
  return loaded.value
}

type Props = {
  children: React.ReactNode
  fallback?: JSX.Element
}

export const EngineInjection = ({ children, fallback }: Props) => {
  const engineInjection = useEngineInjection()
  if (!engineInjection) return fallback ?? <></>
  return <Suspense fallback={fallback}>{children}</Suspense>
}

export const useNetwork = (props: { online?: boolean }) => {
  const userID = useMutableState(EngineState).userID.value
  const ageVerified = useMutableState(AuthState).user.ageVerified.value

  useEffect(() => {
    getMutableState(NetworkState).config.set({
      world: !!props.online,
      media: !!props.online && ageVerified,
      friends: !!props.online,
      instanceID: !!props.online,
      roomID: false
    })
  }, [props.online, ageVerified])

  /** Offline/local world network */
  useEffect(() => {
    if (props.online || !userID) return

    const peerID = Engine.instance.store.peerID
    const peerIndex = 1
    const networkID = userID as any as InstanceID

    const networkState = getMutableState(NetworkState)
    networkState.hostIds.world.set(networkID)
    joinNetwork(networkID, peerID, NetworkTopics.world)
    addOutgoingTopicIfNecessary(NetworkTopics.world)

    NetworkState.worldNetworkState.ready.set(true)

    const network = NetworkState.worldNetwork as Network

    dispatchAction(
      NetworkActions.peerJoined({
        $network: networkID,
        $topic: network.topic,
        $to: Engine.instance.store.peerID,
        peerID,
        peerIndex,
        userID
      })
    )

    return () => {
      dispatchAction(
        NetworkActions.peerLeft({
          $network: networkID,
          $topic: network.topic,
          $to: Engine.instance.store.peerID,
          peerID,
          userID
        })
      )
      leaveNetwork(network)
      networkState.hostIds.world.set(none)
    }
  }, [props.online, userID])
}
