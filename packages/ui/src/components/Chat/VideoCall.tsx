/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import { t } from 'i18next'
import { Resizable } from 're-resizable'
import React, { useEffect, useRef, useState } from 'react'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'
import { VolumeContextMenu } from './VolumeContextMenu'

import { useMediaNetwork } from '@ir-engine/client-core/src/common/services/MediaInstanceConnectionService'
import { useUserAvatarThumbnail } from '@ir-engine/client-core/src/hooks/useUserAvatarThumbnail'
import { useMediaWindows } from '@ir-engine/client-core/src/user/VideoWindows'
import { useGet } from '@ir-engine/common'
import { UserName, userPath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { PeerID, State, getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'
import { MediaStreamState } from '@ir-engine/network/src/media/MediaStreamState'
import { PeerMediaChannelState, PeerMediaStreamInterface } from '@ir-engine/network/src/media/PeerMediaChannelState'

export const UserMedia = (props: { peerID: PeerID; type: 'cam' | 'screen' }) => {
  const { peerID, type } = props

  const mediaNetwork = NetworkState.mediaNetwork

  // Context menu state
  const [showVolumeMenu, setShowVolumeMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  const isSelf = !mediaNetwork || peerID === Engine.instance.store.peerID || peerID === 'self'
  const isScreen = type === 'screen'

  // Get user ID safely
  const userID = mediaNetwork?.users
    ? Object.keys(mediaNetwork.users).find((id) => mediaNetwork.users[id]?.includes(peerID))
    : undefined

  const user = useGet(userPath, userID)
  const userThumbnail = useUserAvatarThumbnail(userID)

  const getUsername = () => {
    if (isSelf && !isScreen) return t('user:person.you')
    if (isSelf && isScreen) return t('user:person.yourScreen')
    const username = user.data?.name ?? 'A User'
    if (!isSelf && isScreen) return username + "'s Screen"
    return username
  }

  const peerMediaChannelState = useHookstate(
    getMutableState(PeerMediaChannelState)[peerID][type] as State<PeerMediaStreamInterface>
  )
  const { videoMediaStream, videoStreamPaused, audioStreamPaused } = peerMediaChannelState.get({
    noproxy: true
  }) as PeerMediaStreamInterface

  const username = getUsername() as UserName

  const ref = useRef<HTMLVideoElement>(null)

  // Handle right click to show volume menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setShowVolumeMenu(true)
  }

  useEffect(() => {
    if (!ref.current || ref.current.srcObject || !videoMediaStream) return

    ref.current.id = `${peerID}_video_xrui`
    ref.current.autoplay = true
    ref.current.muted = true
    ref.current.setAttribute('playsinline', 'true')

    const newVideoTrack = videoMediaStream.getVideoTracks()[0]!.clone()
    ref.current.srcObject = new MediaStream([newVideoTrack])
    ref.current.play()
    ref.current!.style.transform = isSelf ? 'scaleX(-1)' : 'scaleX(1)'
  }, [ref.current, videoMediaStream])

  const toggleVideo = async (e) => {
    e.stopPropagation()
    if (isSelf && !isScreen) {
      MediaStreamState.toggleWebcamPaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareVideoPaused()
    } else {
      peerMediaChannelState.videoStreamPaused.set((val) => !val)
    }
  }

  const toggleAudio = async (e) => {
    e.stopPropagation()
    if (isSelf && !isScreen) {
      MediaStreamState.toggleMicrophonePaused()
    } else if (isSelf && isScreen) {
      MediaStreamState.toggleScreenshareAudioPaused()
    } else {
      peerMediaChannelState.audioStreamPaused.set((val) => !val)
    }
  }

  return (
    <Resizable
      key={username}
      bounds="window"
      defaultSize={{ width: 254, height: 160 }}
      enable={{
        top: false,
        right: true,
        bottom: true,
        left: true,
        topRight: false,
        bottomRight: true,
        bottomLeft: true,
        topLeft: false
      }}
      minWidth={200}
      maxWidth={420}
      minHeight={160}
      maxHeight={250}
    >
      <div
        className={`relative flex h-full items-center justify-center rounded-[5px]`}
        style={{ backgroundColor: 'gray' }} // TODO derive color from user thumbnail
        onContextMenu={handleContextMenu}
      >
        {!videoMediaStream || videoStreamPaused ? (
          <img
            src={userThumbnail}
            alt=""
            crossOrigin="anonymous"
            draggable={false}
            className="h-[40px] w-[40px] max-w-full rounded-full"
            id={peerID + '-thumbnail'}
          />
        ) : (
          <video
            className="h-full w-full"
            ref={ref}
            key={peerID + '-video-container'}
            id={peerID + '-video-container'}
          />
        )}
        <div className="absolute bottom-1 left-1 flex min-w-0  max-w-xs items-center justify-center rounded-[20px] bg-[#B6AFAE] px-1">
          <p className="font-segoe-ui rounded-2xl text-left text-[12px] text-white [text-align-last:center]">
            {username}
          </p>
        </div>

        {/* Media control buttons */}
        <div className="absolute bottom-1 right-1 flex space-x-1">
          {/* Audio toggle button */}
          <button
            className="m-0 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#EDEEF0] hover:bg-gray-200"
            onClick={toggleAudio}
            title={audioStreamPaused ? 'Unmute' : 'Mute'}
          >
            {audioStreamPaused ? (
              <FaMicrophoneSlash className="h-4 w-4 overflow-hidden fill-[#3F3960]" />
            ) : (
              <FaMicrophone className="h-3 w-3 overflow-hidden fill-[#008000]" />
            )}
          </button>

          {/* Video toggle button */}
          <button
            className="m-0 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#EDEEF0] hover:bg-gray-200"
            onClick={toggleVideo}
            title={videoStreamPaused ? 'Enable Video' : 'Disable Video'}
          >
            {videoStreamPaused ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 fill-[#3F3960]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                <path d="M1 15L19 5" strokeWidth="2" stroke="#3F3960" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 fill-[#008000]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            )}
          </button>
        </div>

        {/* Volume context menu */}
        {showVolumeMenu && (
          <VolumeContextMenu
            peerID={peerID}
            type={type}
            position={menuPosition}
            onClose={() => setShowVolumeMenu(false)}
          />
        )}
      </div>
    </Resizable>
  )
}

export const MediaCall = () => {
  const windows = useMediaWindows()
  const mediaNetwork = useMediaNetwork()
  const readyPeers = mediaNetwork?.peers?.keys?.length
    ? Array.from(mediaNetwork.peers.keys as PeerID[]).filter((peerID) => mediaNetwork.value.peers?.[peerID]?.userId)
    : []
  return (
    <div className="mx-1 mt-1 flex flex-wrap gap-1">
      {windows
        .filter(({ peerID }) => readyPeers.includes(peerID))
        .map(({ peerID, type }) => (
          <UserMedia peerID={peerID} type={type} key={peerID} />
        ))}
    </div>
  )
}
