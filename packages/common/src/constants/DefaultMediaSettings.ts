export const defaultMediaSettings = {
  audio: {
    maxBitrate: 32
  },
  video: {
    codec: 'VP9',
    maxResolution: 'hd',
    lowResMaxBitrate: 500,
    midResMaxBitrate: 1000,
    highResMaxBitrate: 10000
  },
  screenshare: {
    codec: 'VP8',
    maxResolution: 'fhd',
    lowResMaxBitrate: 500,
    midResMaxBitrate: 2000,
    highResMaxBitrate: 10000
  }
}
