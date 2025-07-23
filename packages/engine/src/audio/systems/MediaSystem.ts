import { useEffect } from 'react'
import { MeshBasicMaterial, VideoTexture } from 'three'

import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getState, isClient } from '@ir-engine/hyperflux'
import { StandardCallbacks, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'

import { MediaComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { getAudioAsync } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import { VideoComponent, VideoTexturePriorityQueueState } from '../../scene/components/VideoComponent'
import { AudioState, useAudioState } from '../AudioState'
import { PositionalAudioComponent } from '../components/PositionalAudioComponent'

export class AudioEffectPlayer {
  static instance = new AudioEffectPlayer()

  constructor() {
    // only init when running in client
    if (isClient) {
      this.#init()
    }
  }

  static SOUNDS = {
    notification: '/sfx/notification.mp3',
    message: '/sfx/message.mp3',
    alert: '/sfx/alert.mp3',
    ui: '/sfx/ui.mp3'
  }

  bufferPromiseMap = {} as { [path: string]: Promise<AudioBuffer | null> }
  bufferMap = {} as { [path: string]: AudioBuffer }

  loadBuffer = async (path: string) => {
    const [buffer] = await getAudioAsync(path)
    return buffer
  }

  // pool of elements
  #els: HTMLAudioElement[] = []

  #init() {
    if (this.#els.length) return
    for (let i = 0; i < 4; i++) {
      const audioElement = document.createElement('audio')
      audioElement.crossOrigin = 'anonymous'
      audioElement.loop = false
      this.#els.push(audioElement)
    }
  }

  #queue = new Set<string>()

  play = (sound: string, volumeMultiplier = getState(AudioState).notificationVolume) => {
    const masterVolume = getState(AudioState).masterVolume
    if (!this.#els.length || volumeMultiplier === 0 || masterVolume === 0) return
    const audioContext = getState(AudioState).audioContext
    if (this.#queue.has(sound) || audioContext.state === 'suspended') return
    this.#queue.add(sound)

    if (!this.bufferPromiseMap[sound]) {
      // create buffer if doesn't exist
      this.bufferPromiseMap[sound] = this.loadBuffer(sound)
      this.bufferPromiseMap[sound].then((buffer) => {
        if (!buffer) return // keep in queue so we never request it again
        this.bufferMap[sound] = buffer
        this.#queue.delete(sound)
        this.play(sound, volumeMultiplier)
      })
      return
    }

    const source = audioContext.createBufferSource()
    source.buffer = this.bufferMap[sound]
    const el = this.#els.find((el) => el.paused) ?? this.#els[Math.floor(Math.random() * this.#els.length)]
    el.volume = masterVolume * volumeMultiplier
    if (el.src !== sound) el.src = sound
    el.currentTime = 0
    source.start()
    source.connect(audioContext.destination)
    this.#queue.delete(sound)
  }
}

globalThis.AudioEffectPlayer = AudioEffectPlayer

const mediaQuery = defineQuery([MediaComponent])
const videoQuery = defineQuery([VideoComponent])
const audioQuery = defineQuery([PositionalAudioComponent])

const execute = () => {
  for (const entity of mediaQuery.enter()) {
    const media = getMutableComponent(entity, MediaComponent)
    setCallback(entity, StandardCallbacks.PLAY, () => media.paused.set(false))
    setCallback(entity, StandardCallbacks.PAUSE, () => media.paused.set(true))
    setCallback(entity, StandardCallbacks.RESET, () => {
      media.paused.set(!media.autoplay.value)

      //using to force the react to update the seek time if already set to 0
      //due to media's seekTime is not being updated with the media elements current time
      let seekTime = media.seekTime.value
      if (seekTime == 0) {
        seekTime = 0.000001
      } else {
        seekTime = 0
      }
      media.seekTime.set(seekTime)
    })
  }

  const videoPriorityQueue = getState(VideoTexturePriorityQueueState).queue

  /** Use a priority queue with videos to ensure only a few are updated each frame */
  for (const entity of VideoComponent.uniqueVideoEntities) {
    const videoMeshEntity = getComponent(entity, VideoComponent).videoMeshEntity
    const videoMesh = getOptionalComponent(videoMeshEntity, MeshComponent)
    if (videoMesh) {
      const videoTexture = (videoMesh.material as MeshBasicMaterial)?.map as VideoTexture
      if (videoTexture?.isVideoTexture) {
        const video = videoTexture.image
        const hasVideoFrameCallback = 'requestVideoFrameCallback' in video
        if (hasVideoFrameCallback === false || video.readyState < video.HAVE_CURRENT_DATA) continue
        videoPriorityQueue.addPriority(entity, 1)
      }
    }
  }

  videoPriorityQueue.update()

  for (const entity of videoPriorityQueue.priorityEntities) {
    if (!hasComponent(entity, VideoComponent)) continue
    const videoMeshEntity = getComponent(entity, VideoComponent).videoMeshEntity
    const videoTexture = (getComponent(videoMeshEntity, MeshComponent)?.material as MeshBasicMaterial)
      ?.map as VideoTexture
    if (!videoTexture?.isVideoTexture) continue
    videoTexture.needsUpdate = true
  }
}

const reactor = () => {
  if (!isClient) return null

  useEffect(() => {
    const enableAudioContext = () => {
      const audioContext = getState(AudioState).audioContext
      if (audioContext.state === 'suspended') audioContext.resume()
    }

    // This must be outside of the normal ECS flow by necessity, since we have to respond to user-input synchronously
    // in order to ensure media will play programmatically
    const handleAutoplay = () => {
      enableAudioContext()
      window.removeEventListener('pointerup', handleAutoplay)
      window.removeEventListener('keypress', handleAutoplay)
      window.removeEventListener('touchend', handleAutoplay)
      window.removeEventListener('pointerup', handleAutoplay)
      window.removeEventListener('touchend', handleAutoplay)
    }
    // TODO: add destroy callbacks
    window.addEventListener('pointerup', handleAutoplay)
    window.addEventListener('keypress', handleAutoplay)
    window.addEventListener('touchend', handleAutoplay)
    window.addEventListener('pointerup', handleAutoplay)
    window.addEventListener('touchend', handleAutoplay)

    return () => {
      for (const sound of Object.values(AudioEffectPlayer.SOUNDS)) delete AudioEffectPlayer.instance.bufferMap[sound]
    }
  }, [])

  useAudioState()

  return null
}

export const MediaSystem = defineSystem({
  uuid: 'ee.engine.MediaSystem',
  insert: { before: PresentationSystemGroup },
  execute,
  reactor
})
