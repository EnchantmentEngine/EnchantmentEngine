import { useEffect } from 'react'

import { MediaSettingsState } from '@ir-engine/engine/src/audio/MediaSettingsState'
import {
  defineState,
  getMutableState,
  getState,
  syncStateWithLocalStorage,
  useMutableState
} from '@ir-engine/hyperflux'

/**
 * All values ranged from 0 to 1
 */
export const AudioState = defineState({
  name: 'AudioState',
  initial: () => ({
    audioContext: null! as AudioContext,
    cameraGainNode: null! as GainNode,
    gainNodeMixBuses: {
      mediaStreams: null! as GainNode,
      notifications: null! as GainNode,
      music: null! as GainNode,
      soundEffects: null! as GainNode
    },
    masterVolume: 0.5,
    microphoneGain: 0.5,
    positionalMedia: false,
    usePositionalMedia: 'auto' as 'auto' | 'off' | 'on',
    mediaStreamVolume: 1,
    notificationVolume: 1,
    soundEffectsVolume: 1,
    backgroundMusicVolume: 0.5
  }),
  extension: syncStateWithLocalStorage([
    'masterVolume',
    'microphoneGain',
    'positionalMedia',
    'mediaStreamVolume',
    'notificationVolume',
    'soundEffectsVolume',
    'backgroundMusicVolume'
  ])
})

export const useAudioState = () => {
  const audioState = useMutableState(AudioState)

  useEffect(() => {
    const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext
    if (!AudioContext) return

    const audioContext = new AudioContext()
    audioContext.resume()

    const audioState = getMutableState(AudioState)
    audioState.audioContext.set(audioContext)

    const cameraGainNode = audioContext.createGain()
    audioState.cameraGainNode.set(cameraGainNode)
    cameraGainNode.connect(audioContext.destination)

    const currentTime = audioState.audioContext.currentTime.value

    audioState.cameraGainNode.gain.value.setTargetAtTime(audioState.masterVolume.value, currentTime, 0.01)

    /** create gain nodes for mix buses */
    audioState.gainNodeMixBuses.mediaStreams.set(audioContext.createGain())
    audioState.gainNodeMixBuses.mediaStreams.value.connect(audioState.cameraGainNode.value)
    audioState.gainNodeMixBuses.mediaStreams.value.gain.setTargetAtTime(
      audioState.mediaStreamVolume.value,
      currentTime,
      0.01
    )

    audioState.gainNodeMixBuses.notifications.set(audioContext.createGain())
    audioState.gainNodeMixBuses.notifications.value.connect(audioState.cameraGainNode.value)
    audioState.gainNodeMixBuses.notifications.value.gain.setTargetAtTime(
      audioState.notificationVolume.value,
      currentTime,
      0.01
    )

    audioState.gainNodeMixBuses.music.set(audioContext.createGain())
    audioState.gainNodeMixBuses.music.value.connect(audioState.cameraGainNode.value)
    audioState.gainNodeMixBuses.music.value.gain.setTargetAtTime(
      audioState.backgroundMusicVolume.value,
      currentTime,
      0.01
    )

    audioState.gainNodeMixBuses.soundEffects.set(audioContext.createGain())
    audioState.gainNodeMixBuses.soundEffects.value.connect(audioState.cameraGainNode.value)
    audioState.gainNodeMixBuses.soundEffects.value.gain.setTargetAtTime(
      audioState.soundEffectsVolume.value,
      currentTime,
      0.01
    )

    return () => {
      audioState.gainNodeMixBuses.mediaStreams.value.disconnect()
      audioState.gainNodeMixBuses.mediaStreams.set(null!)
      audioState.gainNodeMixBuses.notifications.value.disconnect()
      audioState.gainNodeMixBuses.notifications.set(null!)
      audioState.gainNodeMixBuses.music.value.disconnect()
      audioState.gainNodeMixBuses.music.set(null!)
      audioState.gainNodeMixBuses.soundEffects.value.disconnect()
      audioState.gainNodeMixBuses.soundEffects.set(null!)
    }
  }, [])

  useEffect(() => {
    if (!audioState.audioContext.value) return
    audioState.cameraGainNode.value.gain.setTargetAtTime(
      audioState.masterVolume.value,
      audioState.audioContext.value.currentTime,
      0.01
    )
  }, [audioState.audioContext, audioState.masterVolume])

  useEffect(() => {
    if (!audioState.audioContext.value) return
    audioState.gainNodeMixBuses.value.mediaStreams.gain.setTargetAtTime(
      audioState.mediaStreamVolume.value,
      audioState.audioContext.value.currentTime,
      0.01
    )
  }, [audioState.audioContext, audioState.mediaStreamVolume])

  useEffect(() => {
    if (!audioState.audioContext.value) return
    audioState.gainNodeMixBuses.value.notifications.gain.setTargetAtTime(
      audioState.notificationVolume.value,
      audioState.audioContext.value.currentTime,
      0.01
    )
  }, [audioState.audioContext, audioState.notificationVolume])

  useEffect(() => {
    if (!audioState.audioContext.value) return
    audioState.gainNodeMixBuses.value.soundEffects.gain.setTargetAtTime(
      audioState.soundEffectsVolume.value,
      audioState.audioContext.value.currentTime,
      0.01
    )
  }, [audioState.audioContext, audioState.soundEffectsVolume])

  useEffect(() => {
    if (!audioState.audioContext.value) return
    audioState.gainNodeMixBuses.value.music.gain.setTargetAtTime(
      audioState.backgroundMusicVolume.value,
      audioState.audioContext.value.currentTime,
      0.01
    )
  }, [audioState.audioContext, audioState.backgroundMusicVolume])

  useEffect(() => {
    if (!audioState.positionalMedia.value) return
    getMutableState(MediaSettingsState).immersiveMedia.set(getPositionalMedia())
  }, [audioState.audioContext, audioState.positionalMedia, audioState.usePositionalMedia])
}

export const getPositionalMedia = () => {
  const audioState = getState(AudioState)
  return audioState.usePositionalMedia === 'auto' ? audioState.positionalMedia : audioState.usePositionalMedia === 'on'
}
