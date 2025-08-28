import React from 'react'
import { useTranslation } from 'react-i18next'

import { setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { PlayMode } from '@ir-engine/engine/src/scene/constants/PlayMode'

import { Entity } from '@ir-engine/ecs'
import { EditorComponentType, commitProperties, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import { PlaylistComponent } from '@ir-engine/engine/src/scene/components/PlaylistComponent'
import { usePrevious } from '@ir-engine/hyperflux'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { IoMdAdd, IoMdPause, IoMdPlay, IoMdSkipBackward, IoMdSkipForward } from 'react-icons/io'
import { MdDelete, MdDragIndicator } from 'react-icons/md'
import { RiPlayList2Fill } from 'react-icons/ri'
import 'react-scrubber/lib/scrubber.css'
import { v4 as uuidv4 } from 'uuid'

import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { Checkbox } from '@ir-engine/ui'
import Button from '../../../../primitives/tailwind/Button'
import InputGroup from '../../input/Group'
import SelectInput from '../../input/Select'
import { ControlledStringInput } from '../../input/String'

const PlayModeOptions = [
  {
    label: 'Random',
    value: PlayMode.random
  },
  {
    label: 'Loop',
    value: PlayMode.loop
  },
  {
    label: 'SingleLoop',
    value: PlayMode.singleloop
  }
]

const ItemType = {
  track: 'track'
}

interface Track {
  uuid: string
  src: string
}

/**
 * VolumetricNodeEditor provides the editor view to customize properties.
 *
 * @param       {any} props
 * @constructor
 */
export const PlaylistNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const component = useComponent(props.entity, PlaylistComponent)
  // const currentTrackIndex = useHookstate(-1)

  const addTrack = () => {
    component.tracks.push({
      uuid: uuidv4(),
      src: ''
    })
    commitProperties(
      PlaylistComponent,
      {
        tracks: component.tracks as Track[]
      },
      [props.entity]
    )
  }

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

  const moveTrack = (trackUUID: string, atIndex: number) => {
    const { track, index } = findTrack(trackUUID)
    if (track && index !== -1) {
      component.tracks.splice(index, 1)
      component.tracks.splice(atIndex, 0, track)
      commitProperties(
        PlaylistComponent,
        {
          tracks: component.tracks as Track[]
        },
        [props.entity]
      )
    }
  }

  const [, drop] = useDrop(() => ({ accept: ItemType.track }))

  const togglePause = () => {
    setComponent(props.entity, PlaylistComponent, { paused: !component.paused })
  }

  return (
    <NodeEditor {...props} name="Playlist" Icon={PlaylistNodeEditor.iconComponent}>
      <DndProvider backend={HTML5Backend}>
        <div ref={drop} className="w-full pl-4 pr-2">
          <InputGroup name="Autoplay" label="Autoplay">
            <Checkbox onChange={commitProperty(PlaylistComponent, 'autoplay')} checked={component.autoplay} />
          </InputGroup>
          {component.tracks.length > 0 ? (
            <>
              {component.tracks.map((track, index) => {
                return (
                  <Track
                    entity={props.entity}
                    track={component.tracks[index]}
                    moveTrack={moveTrack}
                    findTrack={findTrack}
                    key={track.uuid}
                    onChange={(value) => {
                      component.tracks[index].src = value || ''
                      if (track.uuid === component.currentTrackUUID) {
                        const newUUID = uuidv4()
                        component.tracks[index].uuid = newUUID
                        component.currentTrackUUID = newUUID
                        commitProperties(
                          PlaylistComponent,
                          {
                            tracks: component.tracks as Track[]
                          },
                          [props.entity]
                        )
                        component.currentTrackUUID = newUUID
                      }
                    }}
                    playing={track.uuid === component.currentTrackUUID && !component.paused}
                    togglePlay={() => {
                      if (track.uuid === component.currentTrackUUID) {
                        setComponent(props.entity, PlaylistComponent, {
                          paused: !component.paused
                        })
                      } else {
                        setComponent(props.entity, PlaylistComponent, {
                          currentTrackUUID: track.uuid,
                          currentTrackIndex: index,
                          paused: false
                        })
                      }
                    }}
                  />
                )
              })}

              <div className="grid grid-cols-2 items-center gap-2">
                <div className="col-span-1 flex items-center justify-start">
                  <div
                    className="text-2xl text-white"
                    onClick={() => PlaylistComponent.playNextTrack(props.entity, -1)}
                  >
                    <IoMdSkipBackward />
                  </div>
                  <div className="text-2xl text-white" onClick={togglePause}>
                    {component.paused ? <IoMdPlay /> : <IoMdPause />}
                  </div>
                  <div className="text-2xl text-white" onClick={() => PlaylistComponent.playNextTrack(props.entity, 1)}>
                    <IoMdSkipForward />
                  </div>
                  <div className="text-2xl text-white" onClick={addTrack}>
                    <IoMdAdd />
                  </div>
                </div>

                <div className="col-span-2">
                  <SelectInput
                    options={PlayModeOptions}
                    value={component.playMode}
                    onChange={commitProperty(PlaylistComponent, 'playMode')}
                  />
                </div>
              </div>
            </>
          ) : (
            <Button size="sm" variant="tertiary" className="w-full" onClick={addTrack}>
              Add track
            </Button>
          )}
        </div>
      </DndProvider>
    </NodeEditor>
  )
}

const Track = ({
  entity,
  track,
  playing,
  moveTrack,
  findTrack,
  onChange,
  togglePlay
}: {
  entity: Entity
  track: Track
  playing: boolean
  moveTrack: (trackUUID: string, atIndex: number) => void
  findTrack: (trackUUID: string) => {
    track: Track | undefined
    index: number
  }
  onChange: (value?: string) => void
  togglePlay: () => void
}) => {
  const originalIndex = findTrack(track.uuid).index
  const [{ opacity }, dragSourceRef, previewRef] = useDrag({
    type: ItemType.track,
    item: { uuid: track.uuid, index: originalIndex },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0 : 1
    })
  })

  const [, connectDrop] = useDrop({
    accept: ItemType.track,
    hover({ uuid: draggedtrackUUID }: { uuid: string; index: number }) {
      if (draggedtrackUUID !== track.uuid) {
        const { index: overIndex } = findTrack(track.uuid)
        moveTrack(draggedtrackUUID, overIndex)
      }
    }
  })

  const previousTrackSource = usePrevious(track.src)

  return (
    <div className="flex items-center justify-between gap-1" ref={(node) => connectDrop(previewRef(node))}>
      <ControlledStringInput
        type="text"
        value={track.src}
        onRelease={(e) => {
          if (e !== previousTrackSource) {
            onChange(e)
          }
        }}
      />
      <div ref={dragSourceRef} className="cursor-move text-2xl text-white">
        <MdDragIndicator />
      </div>
      <div className="text-xl text-white" onClick={togglePlay}>
        {playing ? <IoMdPause /> : <IoMdPlay />}
      </div>
      <div
        className="text-2xl text-white"
        onClick={() => {
          onChange()
          PlaylistComponent.playNextTrack(entity, 0)
        }}
      >
        <MdDelete />
      </div>
    </div>
  )
}

PlaylistNodeEditor.iconComponent = RiPlayList2Fill

export default PlaylistNodeEditor
