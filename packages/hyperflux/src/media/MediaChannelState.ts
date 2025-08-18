import { none } from '@hookstate/core'
import { defineState, getMutableState } from '../functions/StateFunctions'
import { OpaqueType } from '../types/OpaqueType'
import { PeerID } from '../types/Types'

export type MediaChannelType = OpaqueType<'MediaChannelType'> & string

export const webcamVideoMediaChannelType = 'ir.core.webcamVideo.mediaChannel' as MediaChannelType
export const webcamAudioMediaChannelType = 'ir.core.webcamAudio.mediaChannel' as MediaChannelType
export const screenshareVideoMediaChannelType = 'ir.core.screenshareVideo.mediaChannel' as MediaChannelType
export const screenshareAudioMediaChannelType = 'ir.core.screenshareAudio.mediaChannel' as MediaChannelType

export interface MediaStreamInterface {
  stream: MediaStream | null
  quality: 'smallest' | 'auto' | 'largest'
  paused: boolean
  element: HTMLMediaElement
}

export const MediaChannelState = defineState({
  name: 'MediaChannelState',
  initial: {} as {
    [peerID: PeerID]: {
      [mediaTag: MediaChannelType]: MediaStreamInterface
    }
  }
})

export const createPeerMediaChannels = (peerID: PeerID) => {
  console.log('createPeerMediaChannels', peerID)
  const state = getMutableState(MediaChannelState)
  state[peerID].set({
    [webcamAudioMediaChannelType]: {
      stream: null,
      quality: 'smallest',
      paused: false,
      element: document.createElement('audio')
    },
    [webcamVideoMediaChannelType]: {
      stream: null,
      quality: 'smallest',
      paused: false,
      element: document.createElement('video')
    },
    [screenshareAudioMediaChannelType]: {
      stream: null,
      quality: 'auto',
      paused: false,
      element: document.createElement('audio')
    },
    [screenshareVideoMediaChannelType]: {
      stream: null,
      quality: 'auto',
      paused: false,
      element: document.createElement('video')
    }
  })
}

export const removePeerMediaChannels = (peerID: PeerID) => {
  console.log('removePeerMediaChannels', peerID)
  const state = getMutableState(MediaChannelState)
  state[peerID].set(none)
}
