import ProgressBar from '@ir-engine/client-core/src/systems/ui/LoadingDetailView/SimpleProgressBar'
import { defineState, getMutableState, useHookstate } from '@ir-engine/hyperflux'
import React from 'react'

export const ProgressState = defineState({
  name: 'CompressionProgressState',
  initial: {
    progress: 0,
    caption: ''
  }
})

export function CompressedPublishConfirmation() {
  const progressState = useHookstate(getMutableState(ProgressState))
  return (
    <div className="flex items-center justify-center">
      <div className="absolute z-50 w-[30vw] rounded-lg border border-gray-800 bg-surface-2  p-20 shadow-lg">
        <ProgressBar
          bgColor={'#ffffff'}
          completed={progressState.progress.value * 100}
          loopingBarWidth={50}
          height="4px"
          baseBgColor="#2F3137"
          isLabelVisible={false}
          isLooping={false}
          loopingBarSpeed={0.4}
        />
        <div className="mb-8 mt-6  flex justify-between text-xs text-text-primary">
          <span>{progressState.caption.value}</span>
        </div>
      </div>
    </div>
  )
}
