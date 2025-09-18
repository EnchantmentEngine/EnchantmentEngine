import { useEffect } from 'react'

import { Entity, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { getState } from '@ir-engine/hyperflux'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'

import { hasComponent } from '@ir-engine/ecs'
import { Schema } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { AudioState } from '../../audio/AudioState'
import { PlayMode } from '../constants/PlayMode'
import { AudioNodeGroups, createAudioNodeGroup, getNextTrack, MediaElementComponent } from './MediaComponent'
import { ShadowComponent } from './ShadowComponent'
import { UVOL1Component } from './UVOL1Component'
import { UVOL2Component } from './UVOL2Component'

export function handleAutoplay(audioContext: AudioContext, media: HTMLMediaElement, entity: Entity) {
  const attachEventListeners = () => {
    const canvas = getComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent).canvas!
    const playMedia = () => {
      media.play()
      audioContext.resume()
      if (hasComponent(entity, LegacyVolumetricComponent)) {
        setComponent(entity, LegacyVolumetricComponent, { paused: false })
      }
      window.removeEventListener('pointerdown', playMedia)
      window.removeEventListener('keypress', playMedia)
      window.removeEventListener('touchstart', playMedia)
      canvas.removeEventListener('pointerdown', playMedia)
      canvas.removeEventListener('touchstart', playMedia)
    }
    window.addEventListener('pointerdown', playMedia)
    window.addEventListener('keypress', playMedia)
    window.addEventListener('touchstart', playMedia)
    canvas.addEventListener('pointerdown', playMedia)
    canvas.addEventListener('touchstart', playMedia)
  }

  // Try to play. If it fails, attach event listeners to play on user interaction
  media
    .play()
    .catch((e) => {
      if (e.name === 'NotAllowedError') {
        attachEventListeners()
      }
    })
    .then(() => {
      if (hasComponent(entity, LegacyVolumetricComponent)) {
        setComponent(entity, LegacyVolumetricComponent, { paused: false })
      }
    })
}

export const LegacyVolumetricComponent = defineComponent({
  name: 'Legacy Volumetric Component',
  jsonID: 'IR_volumetric_legacy',

  schema: Schema.Object({
    paths: Schema.Array(Schema.String()),
    useLoadingEffect: Schema.Bool({ default: true }),
    autoPauseWhenBuffering: Schema.Bool({ default: true }), // TODO: Implement this for UVOL1
    autoplay: Schema.Bool({ default: true }),
    paused: Schema.Bool({ default: true }),
    initialBuffersLoaded: Schema.Bool({ default: false }),
    hasAudio: Schema.Bool({ default: false }),
    ended: Schema.Bool({ default: true }),
    volume: Schema.Number({ default: 1 }),
    playMode: Schema.Enum(PlayMode, {
      $comment: "A string enum, ie. one of the following values: 'single', 'random', 'loop', 'singleloop'",
      default: PlayMode.loop
    }),
    track: Schema.Number({ default: -1 }),
    forceChangeTrack: Schema.Bool({ default: false }),
    currentTrackInfo: Schema.Object({
      dontReset: Schema.Bool({ default: false }),
      mediaStartTime: Schema.Number({ default: 0 }),
      playbackStartDate: Schema.Number({ default: 0 }),
      playbackRate: Schema.Number({ default: 1 }),
      currentTime: Schema.Number({ default: 0 }),
      duration: Schema.Number({ default: 0 })
    })
  }),

  toJSON: (component) => {
    return {
      paths: component.paths,
      useLoadingEffect: component.useLoadingEffect,
      autoplay: component.autoplay,
      volume: component.volume,
      playMode: component.playMode
    }
  },

  reactor: VolumetricReactor
})

export function VolumetricReactor() {
  const entity = useEntityContext()
  const audioContext = getState(AudioState).audioContext
  const gainNodeMixBuses = getState(AudioState).gainNodeMixBuses
  const volumetric = useComponent(entity, LegacyVolumetricComponent)

  useEffect(() => {
    setComponent(entity, MediaElementComponent, {
      element: document.createElement('video') as HTMLMediaElement
    })
    setComponent(entity, ShadowComponent)
    const videoElement = getComponent(entity, MediaElementComponent)
    const element = videoElement.element
    element.setAttribute('playsinline', 'true')
    element.preload = 'auto'
    element.crossOrigin = 'anonymous'

    if (!AudioNodeGroups.get(element)) {
      const source = audioContext.createMediaElementSource(element)
      const audioNodes = createAudioNodeGroup(element, source, gainNodeMixBuses.soundEffects)

      audioNodes.gain.gain.setTargetAtTime(volumetric.volume, audioContext.currentTime, 0.1)
    }

    return () => {
      removeComponent(entity, UVOL1Component)
      removeComponent(entity, UVOL2Component)
    }
  }, [])

  useEffect(() => {
    if (!volumetric.ended) {
      // If current track is not ended, don't change the track
      return
    }

    const pathCount = volumetric.paths.length

    let nextTrack = getNextTrack(volumetric.track, pathCount, volumetric.playMode)
    const ACCEPTED_TYPES = ['manifest', 'drcs', 'mp4', 'json']

    for (let i = 0; i <= pathCount; i++) {
      const path = volumetric.paths[nextTrack]
      const extension = path ? path.split('.').pop()?.split('?').shift() : ''
      if (path && extension && ACCEPTED_TYPES.includes(extension)) {
        break
      } else {
        if (nextTrack === volumetric.track) {
          // If we've looped through all the tracks and none are valid, return
          return
        }
        nextTrack = getNextTrack(nextTrack, pathCount, volumetric.playMode)
        if (nextTrack === -1) return
      }
    }
    if (nextTrack === -1 || !volumetric.paths[nextTrack]) return

    if (!volumetric.currentTrackInfo.dontReset) {
      resetTrack()
    }
    volumetric.track = nextTrack
    volumetric.forceChangeTrack = !volumetric.forceChangeTrack
    setComponent(entity, LegacyVolumetricComponent)
  }, [volumetric.paths, volumetric.playMode, volumetric.ended])

  const resetTrack = () => {
    // Overwriting with setComponent doesn't cleanup the component
    removeComponent(entity, UVOL1Component)
    removeComponent(entity, UVOL2Component)
    volumetric.initialBuffersLoaded = false
    volumetric.paused = true
    volumetric.currentTrackInfo = {
      dontReset: false,
      mediaStartTime: 0,
      playbackStartDate: 0,
      playbackRate: 1,
      currentTime: 0,
      duration: 0
    }
    setComponent(entity, LegacyVolumetricComponent)
  }

  useEffect(() => {
    if (volumetric.track === -1) return
    setComponent(entity, LegacyVolumetricComponent, { ended: false })
    let manifestPath = volumetric.paths[volumetric.track]
    if (manifestPath.endsWith('.mp4')) {
      // UVOL1
      manifestPath = manifestPath.replace('.mp4', '.manifest')
    } else if (manifestPath.endsWith('.drcs')) {
      // UVOL2
      manifestPath = manifestPath.replace('.drcs', '.manifest')
    }

    fetch(manifestPath)
      .then((response) => response.json())
      .then((json) => {
        if ('type' in json) {
          setComponent(entity, UVOL2Component, {
            manifestPath: manifestPath,
            data: json
          })
        } else {
          setComponent(entity, UVOL1Component, {
            manifestPath: manifestPath,
            data: json
          })
        }
      })
  }, [volumetric.track, volumetric.forceChangeTrack])

  useEffect(() => {
    const volume = volumetric.volume
    const element = getComponent(entity, MediaElementComponent).element as HTMLVideoElement
    const audioNodes = AudioNodeGroups.get(element)
    if (audioNodes) {
      audioNodes.gain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1)
    }
  }, [volumetric.volume])

  return null
}
