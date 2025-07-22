import React from 'react'

import { HiPause, HiPlay } from 'react-icons/hi2'
import Progress, { ProgressProps } from '../../../../primitives/tailwind/Progress'

export interface ProgressBarProps extends ProgressProps {
  paused: boolean
  totalTime: number
}

export default function ProgressBar({ value, paused, totalTime, ...rest }: ProgressBarProps) {
  return (
    <div className="ml-auto mr-6 flex h-10 w-[314px] flex-row place-items-center gap-2 rounded bg-zinc-900 px-2">
      {paused ? <HiPlay className="text-white" /> : <HiPause className="text-white" />}
      <Progress value={(value / totalTime) * 100} className="w-[173px]" barClassName="bg-blue-800 " />
      <div className="w-[85px] truncate text-right text-sm font-normal leading-normal text-neutral-400">
        {paused
          ? 'Paused'
          : `${Math.floor((totalTime * value) / 100 / 60)}:${Math.floor(
              ((totalTime * value) / 100) % 60
            )}  / ${Math.floor(totalTime / 60)}:${Math.floor(totalTime % 60)} `}
      </div>
    </div>
  )
}

ProgressBar.defaultProps = {}
