import { MediaSettingsType } from '@ir-engine/common/src/config'
import useEngineSetting from '@ir-engine/common/src/hooks/useEngineSetting'
import multiLogger from '@ir-engine/common/src/logger'
import {
  MediasoupMediaProducerActions,
  MediasoupMediaProducerConsumerState,
  MediasoupMediaProducersConsumersObjectsState
} from '@ir-engine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import { MediasoupTransportState } from '@ir-engine/common/src/transports/mediasoup/MediasoupTransportState'
import { defineSystem, PresentationSystemGroup } from '@ir-engine/ecs'
import {
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  MediaStreamState,
  NetworkState,
  screenshareAudioMediaChannelType,
  screenshareVideoMediaChannelType,
  useHookstate,
  useMutableState,
  VideoConstants,
  webcamAudioMediaChannelType,
  webcamVideoMediaChannelType
} from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'
import { MediaInstanceState, useMediaNetwork } from '../../common/services/MediaInstanceConnectionService'
import { clientContextParams } from '../../util/ClientContextState'
import { ProducerExtension, WebRTCTransportExtension } from './MediasoupClientFunctions'

const logger = multiLogger.child({
  component: 'client-core:MediasoupMediaTracksSystem',
  modifier: clientContextParams
})

export const MediasoupSelfProducerState = defineState({
  name: 'MediasoupSelfProducerState',
  initial: {
    camVideoProducer: null as ProducerExtension | null,
    camAudioProducer: null as ProducerExtension | null,
    screenVideoProducer: null as ProducerExtension | null,
    screenAudioProducer: null as ProducerExtension | null
  }
})

const MicrophoneReactor = () => {
  const mediaNetworkState = useMediaNetwork()
  const mediaStreamState = useMutableState(MediaStreamState)
  const microphoneEnabled = mediaStreamState.microphoneEnabled.value
  const microphoneMediaStream = mediaStreamState.microphoneMediaStream.value
  const ready = mediaNetworkState?.ready?.value
  const mediasoupSelfProducerState = useMutableState(MediasoupSelfProducerState)
  const camAudioProducer = mediasoupSelfProducerState.camAudioProducer.value

  const mediaSettings = useEngineSetting('client').data?.mediaSettings as MediaSettingsType | undefined

  const mediaStreamAudioSourceNode = useHookstate(null as MediaStreamAudioSourceNode | null)

  useEffect(() => {
    const audioStream = mediaStreamState.microphoneMediaStream.value
    if (!microphoneEnabled || !ready || !audioStream) return

    const network = getState(NetworkState).networks[mediaNetworkState.id.value]

    const channelConnectionState = getState(MediaInstanceState)
    const currentChannelInstanceConnection = channelConnectionState.instances[network.id]
    const channelId = currentChannelInstanceConnection.channelId

    const transport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

    const codecOptions = { ...VideoConstants.CAM_AUDIO_CODEC_OPTIONS }
    if (mediaSettings?.audio) codecOptions.opusMaxAverageBitrate = mediaSettings.audio.maxBitrate * 1000

    const abortController = new AbortController()

    transport
      .produce({
        track: mediaStreamState.microphoneDestinationNode.value!.stream!.getAudioTracks()[0],
        codecOptions,
        appData: { mediaTag: webcamAudioMediaChannelType, channelId: channelId }
      })
      .then((prod) => {
        if (abortController.signal.aborted) return
        const producer = prod as any as ProducerExtension
        getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[producer.id].set(producer)
        mediasoupSelfProducerState.camAudioProducer.set(producer)
      })

    return () => {
      abortController.abort()

      if (mediasoupSelfProducerState.camAudioProducer.value) {
        dispatchAction(
          MediasoupMediaProducerActions.producerClosed({
            producerID: mediasoupSelfProducerState.camAudioProducer.value.id,
            $network: network.id,
            $topic: network.topic
          })
        )
        mediasoupSelfProducerState.camAudioProducer.value.close()
        mediasoupSelfProducerState.camAudioProducer.set(null)
      }
    }
  }, [microphoneMediaStream, microphoneEnabled, ready])

  useEffect(() => {
    if (!ready || !microphoneMediaStream) return

    if (!camAudioProducer || camAudioProducer.closed) return

    const sourceNode = mediaStreamAudioSourceNode.value

    if (!sourceNode) return

    sourceNode.mediaStream.removeTrack(sourceNode.mediaStream.getAudioTracks()[0])
    sourceNode.mediaStream.addTrack(microphoneMediaStream.getAudioTracks()[0])
  }, [microphoneMediaStream, camAudioProducer])

  return null
}

const getCodecEncodings = (settings?: MediaSettingsType['screenshare'] | MediaSettingsType['video']) => {
  let codec, encodings
  if (settings) {
    switch (settings.codec) {
      case 'VP9':
        codec = VideoConstants.VP9_CODEC
        encodings = VideoConstants.CAM_VIDEO_SVC_CODEC_OPTIONS
        break
      case 'h264':
        codec = VideoConstants.H264_CODEC
        encodings = VideoConstants.CAM_VIDEO_SIMULCAST_ENCODINGS
        encodings[0].maxBitrate = settings.lowResMaxBitrate * 1000
        encodings[1].maxBitrate = settings.midResMaxBitrate * 1000
        encodings[2].maxBitrate = settings.highResMaxBitrate * 1000
        break
      case 'VP8':
        codec = VideoConstants.VP8_CODEC
        encodings = VideoConstants.CAM_VIDEO_SIMULCAST_ENCODINGS
        encodings[0].maxBitrate = settings.lowResMaxBitrate * 1000
        encodings[1].maxBitrate = settings.midResMaxBitrate * 1000
        encodings[2].maxBitrate = settings.highResMaxBitrate * 1000
    }
  }

  return { codec, encodings }
}

const WebcamReactor = () => {
  const mediaNetworkState = useMediaNetwork()
  const mediaStreamState = useMutableState(MediaStreamState)
  const webcamEnabled = mediaStreamState.webcamEnabled.value
  const webcamMediaStream = mediaStreamState.webcamMediaStream.value
  const ready = mediaNetworkState?.ready?.value
  const mediasoupSelfProducerState = useMutableState(MediasoupSelfProducerState)
  const camVideoProducer = mediasoupSelfProducerState.camVideoProducer.value
  const mediaSettings = useEngineSetting('client').data?.mediaSettings as MediaSettingsType | undefined

  useEffect(() => {
    if (!webcamEnabled || !ready || !webcamMediaStream) return

    if (camVideoProducer && !camVideoProducer.closed) return

    const network = getState(NetworkState).networks[mediaNetworkState.id.value]

    const channelConnectionState = getState(MediaInstanceState)
    const currentChannelInstanceConnection = channelConnectionState.instances[network.id]
    const channelId = currentChannelInstanceConnection.channelId

    const transport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

    const { codec, encodings } = getCodecEncodings(mediaSettings?.video)

    const abortController = new AbortController()

    transport
      .produce({
        track: webcamMediaStream!.getVideoTracks()[0],
        encodings,
        codecOptions: VideoConstants.CAM_VIDEO_SIMULCAST_CODEC_OPTIONS,
        codec,
        appData: { mediaTag: webcamVideoMediaChannelType, channelId: channelId }
      })
      .then((prod) => {
        if (abortController.signal.aborted) return
        const producer = prod as any as ProducerExtension
        getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[producer.id].set(producer)
        mediasoupSelfProducerState.camVideoProducer.set(producer)
      })

    return () => {
      abortController.abort()

      if (mediasoupSelfProducerState.camVideoProducer.value) {
        dispatchAction(
          MediasoupMediaProducerActions.producerClosed({
            producerID: mediasoupSelfProducerState.camVideoProducer.value.id,
            $network: network.id,
            $topic: network.topic
          })
        )
        mediasoupSelfProducerState.camVideoProducer.value.close()
        mediasoupSelfProducerState.camVideoProducer.set(null)
      }
    }
  }, [webcamMediaStream, webcamEnabled, ready])

  useEffect(() => {
    if (!ready || !webcamMediaStream) return

    if (!camVideoProducer || camVideoProducer.closed) return

    camVideoProducer.replaceTrack({ track: webcamMediaStream.getVideoTracks()[0] })
  }, [webcamMediaStream, camVideoProducer])

  return null
}

const ScreenshareReactor = () => {
  const mediaNetworkState = useMediaNetwork()
  const mediaStreamState = useMutableState(MediaStreamState)
  const screenshareEnabled = mediaStreamState.screenshareEnabled.value
  const screenshareMediaStream = mediaStreamState.screenshareMediaStream.value
  const ready = mediaNetworkState?.ready?.value
  const mediasoupSelfProducerState = useMutableState(MediasoupSelfProducerState)
  const screenVideoProducer = mediasoupSelfProducerState.screenVideoProducer.value
  const screenAudioProducer = mediasoupSelfProducerState.screenAudioProducer.value
  const screenShareAudioPaused = mediaStreamState.screenShareAudioPaused.value
  const mediaSettings = useEngineSetting('client').data?.mediaSettings as MediaSettingsType | undefined

  useEffect(() => {
    if (!screenshareEnabled || !ready || !screenshareMediaStream) return

    if (screenVideoProducer && !screenVideoProducer.closed) return

    const videoTracks = screenshareMediaStream.getVideoTracks()
    if (!videoTracks.length) return logger.error('No video tracks found for screen share')

    const network = getState(NetworkState).networks[mediaNetworkState.id.value]

    const channelConnectionState = getState(MediaInstanceState)
    const currentChannelInstanceConnection = channelConnectionState.instances[network.id]
    const channelId = currentChannelInstanceConnection.channelId

    const transport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

    const { codec, encodings } = getCodecEncodings(mediaSettings?.screenshare)

    const abortController = new AbortController()

    transport
      .produce({
        track: mediaStreamState.screenshareMediaStream.value!.getVideoTracks()[0],
        encodings,
        codecOptions: VideoConstants.CAM_VIDEO_SIMULCAST_CODEC_OPTIONS,
        codec,
        appData: { mediaTag: screenshareVideoMediaChannelType, channelId }
      })
      .then((producer) => {
        if (abortController.signal.aborted) {
          producer.close()
          return
        }

        const videoProducer = producer as any as ProducerExtension

        mediasoupSelfProducerState.screenVideoProducer.set(videoProducer)

        getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[videoProducer.id].set(videoProducer)

        // handler for screen share stopped event (triggered by the browser's built-in screen sharing ui)
        videoProducer!.track!.onended = () => {
          mediaStreamState.screenshareEnabled.set(false)
        }
      })

    // create a producer for audio, if we have it
    const audioTracks = mediaStreamState.screenshareMediaStream.value!.getAudioTracks()
    if (audioTracks.length) {
      transport
        .produce({
          track: audioTracks[0],
          appData: { mediaTag: screenshareAudioMediaChannelType, channelId }
        })
        .then((producer) => {
          if (abortController.signal.aborted) {
            producer.close()
            return
          }
          const audioProducer = producer as any as ProducerExtension
          mediasoupSelfProducerState.screenAudioProducer.set(audioProducer)
          mediaStreamState.screenShareAudioPaused.set(false)
          getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[audioProducer.id].set(audioProducer)
        })
    }

    return () => {
      abortController.abort()

      if (mediasoupSelfProducerState.screenVideoProducer.value) {
        dispatchAction(
          MediasoupMediaProducerActions.producerClosed({
            producerID: mediasoupSelfProducerState.screenVideoProducer.value.id,
            $network: network.id,
            $topic: network.topic
          })
        )
        mediasoupSelfProducerState.screenVideoProducer.value.close()
        mediasoupSelfProducerState.screenVideoProducer.set(null)
      }

      if (mediasoupSelfProducerState.screenAudioProducer.value) {
        dispatchAction(
          MediasoupMediaProducerActions.producerClosed({
            producerID: mediasoupSelfProducerState.screenAudioProducer.value.id,
            $network: network.id,
            $topic: network.topic
          })
        )
        mediasoupSelfProducerState.screenAudioProducer.value.close()
        mediasoupSelfProducerState.screenAudioProducer.set(null)
        mediaStreamState.screenShareAudioPaused.set(true)
      }
    }
  }, [screenshareMediaStream, screenshareEnabled, ready])

  useEffect(() => {
    if (!ready || !screenshareMediaStream) return

    if (!screenShareAudioPaused || !screenAudioProducer || screenAudioProducer.closed) return

    const network = getState(NetworkState).networks[mediaNetworkState.id.value]

    if (screenShareAudioPaused) MediasoupMediaProducerConsumerState.pauseProducer(network, screenAudioProducer.id)
    else MediasoupMediaProducerConsumerState.resumeConsumer(network, screenAudioProducer.id)
    logger.analytics({ event_name: 'screenshare', value: screenShareAudioPaused })
  }, [screenShareAudioPaused])

  return null
}

const reactor = () => {
  const mediaNetworkState = useMediaNetwork()

  /** @todo in future we will have a better way of determining whether we need to connect to a server or not */
  if (!mediaNetworkState?.hostPeerID?.value) return null

  return (
    <>
      <WebcamReactor />
      <MicrophoneReactor />
      <ScreenshareReactor />
    </>
  )
}

export const MediasoupMediaTracksSystem = defineSystem({
  uuid: 'ee.client.MediasoupMediaTracksSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
