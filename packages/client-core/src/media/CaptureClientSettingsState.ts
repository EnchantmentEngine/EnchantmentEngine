import { defineState } from '@ir-engine/hyperflux'

export const CaptureClientSettingsState = defineState({
  name: 'CaptureClientSettingsState',
  initial: () => ({
    tab: 0,
    settings: [
      {
        name: 'Display',
        tabOrder: 0,
        showVideo: true,
        flipVideo: false,
        show2dSkeleton: true
      },
      {
        name: 'Tracking',
        tabOrder: 1,
        modelComplexity: 2,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      },
      {
        name: 'Debug',
        tabOrder: 2,
        throttleSend: false
      }
    ]
  })
})
