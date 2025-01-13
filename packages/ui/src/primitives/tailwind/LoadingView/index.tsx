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

import { useHookstate } from '@ir-engine/hyperflux'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React, { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

const totalFrames = 79
const frames = Array.from({ length: totalFrames }, (_, index) => {
  const frameId = index.toString().padStart(4, '0')
  return `/static/animated-loading/iRE_2D_LOGO_Loading_${frameId}.png`
})

const LoadingView = ({
  title,
  description,
  className,
  fullScreen,
  fullSpace,
  containerClassName,
  titleClassname,
  spinnerOnly,
  animated
}: {
  title?: string
  description?: string
  className?: string
  fullScreen?: boolean
  fullSpace?: boolean
  containerClassName?: string
  titleClassname?: string
  spinnerOnly?: boolean
  animated?: boolean
}) => {
  const animationRef = useRef<HTMLDivElement | null>(null)

  const isLoaded = useHookstate(false)
  const currentFrame = useHookstate(0)

  const preloadImages = async () => {
    const promises = frames.map(
      (src) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.src = src
          img.onload = resolve as any
          img.onerror = reject
        })
    )
    try {
      await Promise.all(promises)
      isLoaded.set(true)
    } catch (err) {
      console.error('Error loading imgs', err)
    }
  }

  useEffect(() => {
    preloadImages()
  }, [])

  useEffect(() => {
    let animationFrameId: number

    const updateFrame = () => {
      if (isLoaded) {
        currentFrame.set((prev) => (prev + 1) % totalFrames)
        animationFrameId = requestAnimationFrame(updateFrame)
      }
    }

    if (animated && isLoaded) {
      animationFrameId = requestAnimationFrame(updateFrame)
    }

    return () => cancelAnimationFrame(animationFrameId)
  }, [isLoaded.value, animated])

  useEffect(() => {
    if (animationRef.current) {
      const frameSrc = frames[currentFrame.value]
      if (frameSrc) {
        animationRef.current.style.backgroundImage = `url(${frameSrc})`
      }
    }
  }, [currentFrame.value])

  const loader = (
    <div role="status" className={twMerge('relative mx-auto my-0 block h-full w-full', className)}>
      <svg
        aria-hidden="true"
        className="h-full w-auto animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  )

  const loaderAnimated = (
    <div
      ref={animationRef}
      style={{
        marginLeft: '30px',
        width: '220px',
        height: '280px',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    />
  )

  return spinnerOnly ? (
    loader
  ) : (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center',
        fullScreen && 'h-screen w-screen',
        fullSpace && 'h-full w-full',
        containerClassName
      )}
      data-testid="loading-view-spinner"
    >
      {animated ? loaderAnimated : loader}
      {title && <Text className={twMerge('mt-1', titleClassname)}>{title}</Text>}
      {description && <Text className="opacity-65">{description}</Text>}
    </div>
  )
}

LoadingView.displayName = 'LoadingView'

export default LoadingView
