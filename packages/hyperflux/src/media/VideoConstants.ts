export const VIDEO_CONSTRAINTS = {
  nhd: { width: { ideal: 640 }, height: { ideal: 360 } },
  fwvga: { width: { ideal: 854 }, height: { ideal: 480 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
  fhd: { width: { ideal: 1920 }, height: { ideal: 1080 } }
}

export const CAM_AUDIO_CODEC_OPTIONS = {
  opusDtx: true,
  opusMaxAverageBitrate: 32000 // 32 kbps
}

export const CAM_VIDEO_SIMULCAST_ENCODINGS = [
  { scaleResolutionDownBy: 4, maxBitrate: 500 * 1000 }, // 500kbps
  { scaleResolutionDownBy: 2, maxBitrate: 1000 * 1000 }, // 1mbps
  { scaleResolutionDownBy: 1, maxBitrate: 10 * 1000 * 1000 } // 10mbps
]

export const CAM_VIDEO_SIMULCAST_CODEC_OPTIONS = {
  videoGoogleStartBitrate: 1000, // 1mbps
  videoGoogleMaxBitrate: 1000 * 1000, // 1gbps
  videoGoogleMinBitrate: 1 // 1kbps
}

export const CAM_VIDEO_SVC_CODEC_OPTIONS = [
  {
    scalabilityMode: 'L3T2'
  }
]

export const SCREEN_SHARE_SIMULCAST_ENCODINGS = [
  { dtx: true, maxBitrate: 500 * 1000 }, // 500kbps
  { dtx: true, maxBitrate: 2 * 1000 * 1000 }, // 2mbps
  { dtx: true, maxBitrate: 10 * 1000 * 1000 } // 10mbps
]

export const VP8_CODEC = {
  kind: 'video',
  mimeType: 'video/VP8',
  clockRate: 90000
}

export const VP9_CODEC = {
  kind: 'video',
  mimeType: 'video/VP9',
  clockRate: 90000
}

export const H264_CODEC = {
  kind: 'video',
  mimeType: 'video/h264',
  clockRate: 90000,
  parameters: {
    'packetization-mode': 1,
    'profile-level-id': '4d0032',
    'level-asymmetry-allowed': 1
  }
}

export const OPUS_STEREO_CODEC = {
  kind: 'audio',
  mimeType: 'audio/opus',
  clockRate: 48000,
  channels: 2
}

export const VideoConstants = {
  VIDEO_CONSTRAINTS,
  CAM_AUDIO_CODEC_OPTIONS,
  CAM_VIDEO_SIMULCAST_ENCODINGS,
  CAM_VIDEO_SIMULCAST_CODEC_OPTIONS,
  CAM_VIDEO_SVC_CODEC_OPTIONS,
  SCREEN_SHARE_SIMULCAST_ENCODINGS,
  VP8_CODEC,
  VP9_CODEC,
  H264_CODEC,
  OPUS_STEREO_CODEC
}
