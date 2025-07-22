import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, getMutableComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NO_PROXY } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { PlayMode } from '../constants/PlayMode'

export const PlaylistComponent = defineComponent({
  name: 'PlaylistComponent',
  jsonID: 'EE_playlist',

  schema: S.Object({
    tracks: S.Array(
      S.Object({
        uuid: S.String(),
        src: S.String()
      })
    ),
    currentTrackUUID: S.String(),
    currentTrackIndex: S.Number({ default: -1 }),
    paused: S.Bool({ default: true }),
    playMode: S.Enum(PlayMode, {
      $comment: "A string enum, ie. one of the following values: 'single', 'random', 'loop', 'singleloop'",
      default: PlayMode.loop
    }),
    autoplay: S.Bool({ default: true })
  }),

  toJSON: (component) => {
    return {
      tracks: component.tracks,
      playMode: component.playMode,
      autoplay: component.autoplay
    }
  },

  playNextTrack: (entity, delta = 1) => {
    const component = getMutableComponent(entity, PlaylistComponent)
    const tracksCount = component.tracks.value.length

    if (tracksCount === 0) return

    if (tracksCount === 1 || component.playMode.value === PlayMode.singleloop) {
      const currentTrackUUID = component.currentTrackUUID.value
      component.currentTrackUUID.set('')
      component.currentTrackUUID.set(currentTrackUUID)

      return
    }

    if (component.playMode.value === PlayMode.loop) {
      const previousTrackIndex = (component.currentTrackIndex.value + delta + tracksCount) % tracksCount
      component.currentTrackUUID.set(component.tracks[previousTrackIndex].uuid.value)
    } else if (component.playMode.value === PlayMode.random) {
      let randomIndex = (Math.floor(Math.random() * tracksCount) + tracksCount) % tracksCount

      // Ensure that the random index is different from the current track index
      while (randomIndex === component.currentTrackIndex.value) {
        randomIndex = (Math.floor(Math.random() * tracksCount) + tracksCount) % tracksCount
      }

      component.currentTrackUUID.set(component.tracks[randomIndex].uuid.value)
    }
  },
  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, PlaylistComponent)

    const findTrack = (trackUUID: string) => {
      for (let i = 0; i < component.tracks.length; i++) {
        if (component.tracks[i].uuid.value === trackUUID) {
          return {
            track: component.tracks[i].get(NO_PROXY),
            index: i
          }
        }
      }
      return {
        track: undefined,
        index: -1
      }
    }

    useEffect(() => {
      const index = findTrack(component.currentTrackUUID.value).index
      component.currentTrackIndex.set(index)
    }, [component.currentTrackUUID, component.tracks])

    useEffect(() => {
      if (component.tracks.length === 0) {
        component.merge({
          currentTrackUUID: '',
          currentTrackIndex: -1
        })
        return
      }
    }, [component.tracks])

    useEffect(() => {
      if (component.autoplay.value && component.tracks.length > 0) {
        let nonEmptyTrackIndex = -1
        for (let i = 0; i < component.tracks.length; i++) {
          if (component.tracks[i].src.value !== '') {
            nonEmptyTrackIndex = i
            break
          }
        }
        if (nonEmptyTrackIndex === -1) return

        if (component.currentTrackUUID.value === '') {
          component.merge({
            currentTrackUUID: component.tracks[nonEmptyTrackIndex].uuid.value,
            currentTrackIndex: nonEmptyTrackIndex
          })
          component.paused.set(false)
        }
      }
    }, [component.autoplay, component.tracks])

    return null
  }
})
