import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, getComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Schema } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { PlayMode } from '../constants/PlayMode'

export const PlaylistComponent = defineComponent({
  name: 'PlaylistComponent',
  jsonID: 'EE_playlist',

  schema: Schema.Object({
    tracks: Schema.Array(
      Schema.Object({
        uuid: Schema.String(),
        src: Schema.String()
      })
    ),
    currentTrackUUID: Schema.String(),
    currentTrackIndex: Schema.Number({ default: -1 }),
    paused: Schema.Bool({ default: true }),
    playMode: Schema.Enum(PlayMode, {
      $comment: "A string enum, ie. one of the following values: 'single', 'random', 'loop', 'singleloop'",
      default: PlayMode.loop
    }),
    autoplay: Schema.Bool({ default: true })
  }),

  toJSON: (component) => {
    return {
      tracks: component.tracks,
      playMode: component.playMode,
      autoplay: component.autoplay
    }
  },

  playNextTrack: (entity, delta = 1) => {
    const component = getComponent(entity, PlaylistComponent)
    const tracksCount = component.tracks.length

    if (tracksCount === 0) return

    if (tracksCount === 1 || component.playMode === PlayMode.singleloop) {
      const currentTrackUUID = component.currentTrackUUID
      component.currentTrackUUID = ''
      component.currentTrackUUID = currentTrackUUID
      setComponent(entity, PlaylistComponent)
      return
    }

    if (component.playMode === PlayMode.loop) {
      const previousTrackIndex = (component.currentTrackIndex + delta + tracksCount) % tracksCount
      setComponent(entity, PlaylistComponent, { currentTrackUUID: component.tracks[previousTrackIndex].uuid })
    } else if (component.playMode === PlayMode.random) {
      let randomIndex = (Math.floor(Math.random() * tracksCount) + tracksCount) % tracksCount

      // Ensure that the random index is different from the current track index
      while (randomIndex === component.currentTrackIndex) {
        randomIndex = (Math.floor(Math.random() * tracksCount) + tracksCount) % tracksCount
      }

      setComponent(entity, PlaylistComponent, { currentTrackUUID: component.tracks[randomIndex].uuid })
    }
  },
  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, PlaylistComponent)

    const findTrack = (trackUUID: string) => {
      for (let i = 0; i < component.tracks.length; i++) {
        if (component.tracks[i].uuid === trackUUID) {
          return {
            track: component.tracks[i],
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
      const index = findTrack(component.currentTrackUUID).index
      setComponent(entity, PlaylistComponent, {
        currentTrackIndex: index
      })
    }, [component.currentTrackUUID, component.tracks])

    useEffect(() => {
      if (component.tracks.length === 0) {
        setComponent(entity, PlaylistComponent, {
          currentTrackUUID: '',
          currentTrackIndex: -1
        })
        return
      }
    }, [component.tracks])

    useEffect(() => {
      if (component.autoplay && component.tracks.length > 0) {
        let nonEmptyTrackIndex = -1
        for (let i = 0; i < component.tracks.length; i++) {
          if (component.tracks[i].src !== '') {
            nonEmptyTrackIndex = i
            break
          }
        }
        if (nonEmptyTrackIndex === -1) return

        if (component.currentTrackUUID === '') {
          setComponent(entity, PlaylistComponent, {
            currentTrackUUID: component.tracks[nonEmptyTrackIndex].uuid,
            currentTrackIndex: nonEmptyTrackIndex,
            paused: false
          })
        }
      }
    }, [component.autoplay, component.tracks])

    return null
  }
})
