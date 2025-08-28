import { useClickOutside, useTouchOutside } from '@ir-engine/common/src/utils/useClickOutside'
import {
  getMutableState,
  MediaChannelState,
  screenshareAudioMediaChannelType,
  screenshareVideoMediaChannelType,
  useHookstate,
  webcamAudioMediaChannelType,
  webcamVideoMediaChannelType
} from '@ir-engine/hyperflux'
import { ArrowTopRightOnSquareSm, Microphone01Lg, MicrophoneOff, VolumeMaxLg, VolumeXLg } from '@ir-engine/ui/src/icons'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Canvas from '@ir-engine/ui/src/primitives/tailwind/Canvas'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { ReportUserState } from '../../util/ReportUserState'
import { useUserMediaWindowHook, WindowType } from './hook'

export const SingleVideoWindow = ({ peerID, type }: WindowType): JSX.Element => {
  const { isSelf, isPiP, isScreen, videoMediaStream, avatarThumbnail, videoStreamPaused, togglePiP } =
    useUserMediaWindowHook({
      peerID,
      type
    })

  const { t } = useTranslation()

  const audioChannelType = type === 'screen' ? screenshareAudioMediaChannelType : webcamAudioMediaChannelType
  const videoChannelType = type === 'screen' ? screenshareVideoMediaChannelType : webcamVideoMediaChannelType

  const audioElement = useHookstate(getMutableState(MediaChannelState)[peerID][audioChannelType]).element
    .value as HTMLAudioElement
  const videoElement = useHookstate(getMutableState(MediaChannelState)[peerID][videoChannelType]).element
    .value as HTMLVideoElement

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasCtxRef = useRef<CanvasRenderingContext2D>()
  const isMoreButtonVisible = useHookstate(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // @todo - currently this adds lots of systems unnecessarily
  // useDrawMocapLandmarks(videoElement, canvasCtxRef, canvasRef, peerID)

  useEffect(() => {
    videoElement.draggable = false
    document.getElementById(peerID + '-' + type + '-video-container')?.append(videoElement)
    document.getElementById(peerID + '-' + type + '-audio-container')?.append(audioElement)
  }, [])

  useEffect(() => {
    videoElement.style.transform = isSelf ? 'scaleX(-1)' : 'scaleX(1)'
  }, [isSelf])

  useEffect(() => {
    if (canvasRef.current && canvasRef.current.width !== videoElement.clientWidth) {
      canvasRef.current.width = videoElement.clientWidth
    }

    if (canvasRef.current && canvasRef.current.height !== videoElement.clientHeight) {
      canvasRef.current.height = videoElement.clientHeight
    }

    if (canvasRef.current) canvasCtxRef.current = canvasRef.current.getContext('2d')!
  })

  useClickOutside(containerRef, () => isMoreButtonVisible.set(false))
  useTouchOutside(containerRef, () => isMoreButtonVisible.set(false))

  return (
    <div className="group/video-window flex items-center gap-x-2" ref={containerRef}>
      <div
        tabIndex={0}
        id={peerID + '_' + type + '_container'}
        className={twMerge(
          'pointer-events-auto relative h-[80px] w-[80px] overflow-hidden rounded-[90px] lg:h-[120px] lg:w-[120px]',
          `${(!videoMediaStream || videoStreamPaused) && 'hidden lg:block'}`
        )}
        data-testid="video-window"
        onClick={() => {
          if (isScreen && isPiP) togglePiP()
        }}
        onMouseOver={() => isMoreButtonVisible.set((prev) => !prev)}
      >
        {(!videoMediaStream || videoStreamPaused) && (
          <img
            src={avatarThumbnail}
            alt={t('user:avatar.avatar')}
            data-testid="avatar-thumbnail"
            crossOrigin="anonymous"
            draggable={false}
            className="bg-[radial-gradient(circle,_#DDDDDD,_#726B65)]"
          />
        )}
        <span
          className="[&>video]:h-full [&>video]:w-full [&>video]:object-cover"
          key={peerID + '-' + type + '-video-container'}
          id={peerID + '-' + type + '-video-container'}
        />
        <div className="pointer-events-none absolute top-0 h-full w-full">
          <Canvas ref={canvasRef} />
        </div>
        <span key={peerID + '-' + type + '-audio-container'} id={peerID + '-' + type + '-audio-container'} />
      </div>
      {!isSelf && (
        <Button
          variant="primary"
          size="sm"
          className={`hidden lg:group-hover/video-window:flex ${isMoreButtonVisible.value ? 'flex' : ''}`}
          onClick={() => {
            isMoreButtonVisible.set(false)
            ReportUserState.setReportedPeerId(peerID)
          }}
        >
          {t('user:videoWindows.more')}
          <ArrowTopRightOnSquareSm />
        </Button>
      )}
    </div>
  )
}

export const SingleVideoWindowWidget = ({ peerID, type }: WindowType): JSX.Element => {
  const { username, isSelf, videoMediaStream, avatarThumbnail, videoStreamPaused, audioStreamPaused, toggleAudio } =
    useUserMediaWindowHook({ peerID, type })

  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!ref.current || ref.current.srcObject || !videoMediaStream) return

    ref.current.id = `${peerID}_video_xrui`
    ref.current.autoplay = true
    ref.current.muted = true
    ref.current.setAttribute('playsinline', 'true')

    const newVideoTrack = videoMediaStream.getVideoTracks()[0].clone()
    ref.current.srcObject = new MediaStream([newVideoTrack])
    ref.current.play()
  }, [ref.current, videoMediaStream])

  return (
    <div
      style={{
        height: '100px',
        width: '100px',
        background: 'white',
        // borderRadius: '50px', // todo - fix video overflow to make round - see if we can replace the geometry of the layer with a circle geom
        border: '3px solid var(--iconButtonSelectedBackground)',
        overflow: 'hidden'
      }}
      xr-layer="true"
    >
      {!videoMediaStream || videoStreamPaused ? (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src={avatarThumbnail}
          alt=""
          crossOrigin="anonymous"
          draggable={false}
          xr-layer="true"
        />
      ) : (
        <video
          xr-layer="true"
          style={{ height: 'auto', maxWidth: '100px' }}
          ref={ref}
          key={peerID + '-video-container'}
          id={peerID + '-video-container-xrui'}
        />
      )}
      <div
        style={{
          fontFamily: 'var(--lato)',
          textAlign: 'center',
          width: '100%',
          margin: '14px 0',
          color: 'var(--textColor)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
        xr-layer="true"
      >
        {username}
        <button style={{ margin: 0 }} onClick={toggleAudio} xr-layer="true">
          {isSelf ? (
            audioStreamPaused ? (
              <MicrophoneOff />
            ) : (
              <Microphone01Lg />
            )
          ) : audioStreamPaused ? (
            <VolumeXLg />
          ) : (
            <VolumeMaxLg />
          )}
        </button>
      </div>
    </div>
  )
}
