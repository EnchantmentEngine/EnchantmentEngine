import { defineSystem, Entity, PresentationSystemGroup, QueryReactor, useComponent } from '@ir-engine/ecs'
import { MediaElementComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import {
  MediaChannelType,
  RTCPeerConnectionState,
  screenshareAudioMediaChannelType,
  webcamAudioMediaChannelType
} from '@ir-engine/hyperflux'
import { defineState, getMutableState, useMutableState } from '@ir-engine/hyperflux/src/functions/StateFunctions'
import { NetworkID, PeerID } from '@ir-engine/hyperflux/src/types/Types'
import hark from 'hark'
import React, { useEffect } from 'react'

const IncommingMediaReactor = (props: {
  peerID: PeerID
  trackID: string
  mediaTag: MediaChannelType | null
  stream: MediaStream | null
}) => {
  const { peerID, trackID, mediaTag, stream } = props
  const isAudio = mediaTag === webcamAudioMediaChannelType || mediaTag === screenshareAudioMediaChannelType

  useEffect(() => {
    if (!stream || !isAudio) return

    let unmounted = false
    const harkEvents = hark(stream, { play: false })

    harkEvents.on('speaking', () => {
      if (unmounted) return
      AudioDuckingState.addEvent(trackID)
    })

    const cleanup = () => {
      unmounted = true
      AudioDuckingState.removeEvent(trackID)
      harkEvents.stop()
    }

    harkEvents.on('stopped_speaking', cleanup)

    return cleanup
  }, [stream, isAudio])

  return null
}

const MediaElementReactor = (props: { entity: Entity }) => {
  const { entity } = props
  const state = useMutableState(AudioDuckingState)
  const mediaElement = useComponent(entity, MediaElementComponent)
  const duckingEnabled = AudioDuckingState.useDuckAudioEnabled()

  useEffect(() => {
    const element = mediaElement.element
    if (!element || !duckingEnabled) return

    const prevVolume = element.volume
    element.volume = prevVolume * state.duckingModifier.value
    return () => {
      element.volume = prevVolume
    }
  }, [duckingEnabled, state.duckingModifier.value, mediaElement.element])

  return null
}

export const AudioDuckingState = defineState({
  name: 'AudioDuckingState',
  initial: () => ({
    duckingModifier: 0.3,
    events: new Set<string>()
  }),

  addEvent: (trackID: string) => {
    getMutableState(AudioDuckingState).events.set((prev) => {
      prev.add(trackID)
      return prev
    })
  },

  removeEvent: (trackID: string) => {
    getMutableState(AudioDuckingState).events.set((prev) => {
      prev.delete(trackID)
      return prev
    })
  },

  useDuckAudioEnabled: (): boolean => {
    const state = useMutableState(AudioDuckingState)
    return state.events.value.size > 0
  }
})

export const AudioDuckingSystem = defineSystem({
  uuid: 'ee.client.AudioDuckingSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const peerConnectionState = useMutableState(RTCPeerConnectionState)

    const TrackReactor = (props: { networkID: NetworkID; peerID: PeerID; trackID: string }) => {
      const { networkID, peerID, trackID } = props
      const track = useMutableState(RTCPeerConnectionState)[networkID][peerID].incomingMediaTracks[trackID].value

      return (
        <IncommingMediaReactor
          key={trackID}
          peerID={peerID as PeerID}
          trackID={trackID}
          mediaTag={track.mediaTag}
          stream={track.stream}
        />
      )
    }

    const PeerReactor = (props: { networkID: NetworkID; peerID: PeerID }) => {
      const peerConnectionState = useMutableState(RTCPeerConnectionState)[props.networkID][props.peerID]

      return (
        <>
          {Object.keys(peerConnectionState.incomingMediaTracks.value).map((trackID) => (
            <TrackReactor key={trackID} networkID={props.networkID} peerID={props.peerID} trackID={trackID} />
          ))}
        </>
      )
    }

    const NetworkReactor = (props: { networkID: NetworkID }) => {
      const networkConnectionState = useMutableState(RTCPeerConnectionState)[props.networkID]

      return (
        <>
          {Object.keys(networkConnectionState.value).map((peerID) => (
            <PeerReactor key={peerID} networkID={props.networkID} peerID={peerID as PeerID} />
          ))}
        </>
      )
    }

    return (
      <>
        {Object.keys(peerConnectionState.value).map((networkID) => {
          return <NetworkReactor key={networkID} networkID={networkID as NetworkID} />
        })}
        <QueryReactor Components={[MediaElementComponent]} ChildEntityReactor={MediaElementReactor} />
      </>
    )
  }
})
