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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'

import { TouchGamepad } from '@ir-engine/client-core/src/common/components/TouchGamepad'
import { EngineState } from '@ir-engine/ecs'
import { getMutableState, NO_PROXY, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { useTranslation } from 'react-i18next'
import { LoadingSystemState } from '../../systems/state/LoadingState'
import { ViewerMenuState } from '../../util/ViewerMenuState'
import { ARPlacement } from '../ARPlacement'
import { XRLoading } from '../XRLoading'

import { ToolbarAndSidebar } from './ToolbarAndSidebar'

import { ChatMenu } from './ChatMenu'
import {
  CamButton,
  containerStyles as containerStyles_base,
  gridStyles_base,
  MicButton,
  ScreenshareButton,
  sectionStyles_base,
  ToolbarMenu
} from './ToolbarMenu'

import { ChevronLeftMd, ChevronRightMd, Expand01Md, VolumeMinMd, VolumeXMd } from '@ir-engine/ui/src/icons'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { twMerge } from 'tailwind-merge'
import { MultimediaStateProvider } from './MultimediaStateProvider'

const useIsPortrait = () => {
  const isPortrait = useHookstate(window.matchMedia('(orientation: portrait)').matches)

  useLayoutEffect(() => {
    const orientationChangeHandler = () => {
      if (screen.orientation.type.match('portrait')) {
        isPortrait.set(true)
      } else {
        isPortrait.set(false)
      }
    }
    screen.orientation.addEventListener('change', orientationChangeHandler)
    return () => {
      screen.orientation.removeEventListener('change', orientationChangeHandler)
    }
  }, [])

  return isPortrait
}

function interpolateRange(value, [fromMax, fromMin], [toMax, toMin]) {
  const normalized = (value - fromMin) / (fromMax - fromMin)
  const toRange = toMax - toMin

  return toMin + normalized * toRange
}

const smallIconButtonStyles = `
  rounded-full
  text-white
  text-3xl
  font-bold
  w-10
  h-10
  flex
  items-center
  justify-center
  border-2
  border-b-white/0
  border-white/10
  shadow-xl
  
  bg-white/10
  
  hover:bg-white/20
`

const largeIconButtonStyles = `
  rounded-full
  text-white
  text-3xl
  font-bold
  w-14
  h-14
  flex
  items-center
  justify-center
  border-2
  border-b-white/0
  border-white/10
  shadow-xl
  
  bg-white/10
  backdrop-blur-lg
  
  hover:bg-white/20
`

const multiVideoContainerStyles = `
  absolute
  left-6
  top-6
  
  pointer-events-auto
  select-none
  
  flex
  flex-col
  gap-y-2
`

const videosListStyles = `
  scrollbar-hide
  overflow-y-auto
  cursor-pointer
`

const videosStyles = `
  pointer-events-auto
  sticky top-0
  z-10
`

const videoStyles = `
  flex items-center justify-center
  rounded-xl
  border-2
  border-white/90
  bg-white/10
  backdrop-blur-3xl
  text-xl
  font-bold
  text-white
  transition-transform
  duration-150
`

const collapsedVideosStyles = `
  sticky top-0
  z-10
  flex
  cursor-pointer
`

const multiVideoButtonsStyles = `
  flex
  justify-between
`

const MultiVideos = ({ handleSidebarOpen }) => {
  const [list, setList] = useState([...Array(40)])
  const [collapsed, setCollapsed] = useState(true)
  const [muted, setMuted] = useState(false)

  const container = React.useRef<HTMLDivElement>()
  const videosRef = React.useRef<HTMLDivElement>()

  const _scrollYProgress = useRef(0)

  const { scrollYProgress } = useScroll({
    container: container
  })

  const perVideoPercent = list.length && 1 / list.length
  const windowSize = 4
  const stackSize = 2

  const stackVideoGap = 0.4
  const windowVideoGap = 0.5

  const stackScaleMin = 0.75

  const halfWindowSize = windowSize / 2

  const aspectRatio = 9 / 16

  const videoWidth = 10
  const videoHeight = videoWidth * aspectRatio

  const scrollHeightMultiplier = 10

  const windowVideoHeightAndGap = videoHeight + windowVideoGap

  const createVideos = useCallback(() => {
    if (!videosRef.current) {
      return
    }

    const videos = list.map((__, i) => {
      const videoContainer = document.createElement('div')
      const video = document.createElement('div')

      videoContainer.className = `
        absolute
        transition-transform
        duration-200
      `

      video.className = videoStyles

      video.style.textShadow = `0 0.03em 0.08em hsla(0, 0%, 0%, 0.4)`

      video.style.height = `${videoHeight}rem`
      video.style.width = `${videoWidth}rem`

      video.innerHTML = i

      videoContainer.appendChild(video)

      return videoContainer
    })

    videosRef.current.replaceChildren(...videos)
  }, [videosRef.current, list.length])

  const positionVideos = useCallback(
    (latest = 0) => {
      const minScroll = 1 / list.length
      const maxScroll = (list.length - (windowSize - 1)) / list.length
      _scrollYProgress.current = Math.min(Math.max(latest, minScroll), maxScroll)

      const currentVideoIndex = Math.round(_scrollYProgress.current * list.length)

      const windowTopIndex = Math.max(Math.floor(currentVideoIndex - halfWindowSize) + 1, 0)
      const windowBottomIndex = Math.max(Math.floor(currentVideoIndex + halfWindowSize), 0)

      const topStackTopIndex = Math.max(windowTopIndex - stackSize, 0)
      const topStackBottomIndex = windowTopIndex
      const bottomStackTopIndex = windowBottomIndex
      const bottomStackBottomIndex = windowBottomIndex + stackSize

      list.map((__, i) => {
        const videoEl = videosRef.current.children[i]

        const above = i < windowTopIndex
        const below = i > windowBottomIndex

        const isWithinWindow = !above && !below

        const isInTopStack = i >= topStackTopIndex && i < topStackBottomIndex
        const isInBottomStack = i > bottomStackTopIndex && i <= bottomStackBottomIndex
        const visible = isWithinWindow || isInTopStack || isInBottomStack
        const hasTopStack = windowTopIndex > 0

        const indexWithinWindow = i - windowTopIndex
        const indexWithinTopStack = i - topStackTopIndex
        const indexWithinBottomStack = i - bottomStackTopIndex

        const paddingFromTopStack = hasTopStack
          ? Math.min(stackSize, Math.max(0, topStackBottomIndex)) * stackVideoGap
          : 0

        const paddingFromWindow =
          (Math.min(windowSize, windowBottomIndex + 1) - (isInBottomStack ? 1 : 0)) * windowVideoHeightAndGap

        const translateY = isInTopStack
          ? indexWithinTopStack * stackVideoGap
          : isWithinWindow
          ? paddingFromTopStack + indexWithinWindow * windowVideoHeightAndGap
          : isInBottomStack
          ? paddingFromTopStack + paddingFromWindow + indexWithinBottomStack * stackVideoGap
          : 0

        const percentIntoTopStack = (stackSize - (topStackBottomIndex - i)) / stackSize
        const percentIntoBottomStack = (bottomStackBottomIndex - i) / stackSize

        const topStackScale = interpolateRange(percentIntoTopStack, [1, 0], [1, stackScaleMin])
        const bottomStackScale = interpolateRange(percentIntoBottomStack, [1, 0], [1, stackScaleMin])

        const scale = isWithinWindow ? `1.0` : isInTopStack ? topStackScale : isInBottomStack ? bottomStackScale : `1.0`
        videoEl.style.display = visible ? `block` : `none`

        videoEl.style.transform = `
        translateY(${translateY}rem)
      `

        videoEl.children[0].style.transformOrigin = isInTopStack
          ? `top center`
          : isWithinWindow
          ? `center center`
          : isInBottomStack
          ? `bottom center`
          : ``

        videoEl.children[0].style.transform = `
        scale(${scale})
      `

        const withBottomZIndexOverlap = i === windowBottomIndex ? windowBottomIndex - 2 : windowBottomIndex - 1

        videoEl.style.zIndex = isInBottomStack ? -indexWithinBottomStack : isWithinWindow ? withBottomZIndexOverlap : i
      })
    },
    [videosRef.current, list.length]
  )

  const positionVideosWithCollapsed = useCallback(
    (latest = 0) => {
      if (collapsed) {
        return
      }

      positionVideos(latest)
    },
    [collapsed]
  )
  useMotionValueEvent(scrollYProgress, 'change', positionVideosWithCollapsed)
  useMotionValueEvent(scrollYProgress, 'renderRequest', positionVideosWithCollapsed)

  useLayoutEffect(() => {
    if (!container.current || !videosRef.current || !list.length) {
      return
    }

    createVideos()
    positionVideos(0)
  }, [container.current, videosRef.current, list.length])

  const CollapsedVideo = ({ id }) => {
    const scale = interpolateRange(id, [0, stackSize], [1, stackScaleMin])

    return (
      <div
        style={{
          zIndex: -id
        }}
        className={twMerge(
          `
          absolute
          transition-transform
          duration-200
        `,
          ``
        )}
      >
        <div
          style={{
            height: `${videoHeight}rem`,
            width: `${videoWidth}rem`,
            transform: `translateY(${id * stackVideoGap}rem) scale(${scale})`
          }}
          className={twMerge(
            `
            origin-bottom
          `,
            videoStyles
          )}
        >
          {id}
        </div>
      </div>
    )
  }

  const collapsedVideos = list
    .filter((__, i) => {
      return i <= stackSize
    })
    .reverse()
    .map((__, i) => {
      return <CollapsedVideo key={i} id={i} />
    })

  const scrollHeight = (list.length - (windowSize - 1)) * scrollHeightMultiplier
  const videosListHeight = videoHeight + stackSize * stackVideoGap

  return (
    <div className={multiVideoContainerStyles}>
      <div
        ref={container}
        style={{
          height: collapsed ? `${videosListHeight}rem` : `25.7rem`
        }}
        className={twMerge(videosListStyles)}
      >
        <button
          style={{
            height: `${videoHeight}rem`,
            width: `${videoWidth}rem`
          }}
          onClick={() => setCollapsed((prev) => false)}
          className={twMerge(collapsedVideosStyles, collapsed ? `` : `hidden`)}
        >
          {collapsedVideos}
        </button>
        <>
          <div
            onClick={() => setCollapsed((prev) => true)}
            ref={videosRef}
            className={twMerge(videosStyles, collapsed ? `hidden` : ``)}
          />
          <div
            style={{
              height: `${scrollHeight}rem`,
              width: `${videoWidth}rem`
            }}
          />
        </>
      </div>
      {collapsed ? (
        <></>
      ) : (
        <div className={multiVideoButtonsStyles}>
          <button onClick={() => setMuted((prev) => !prev)} className={twMerge(largeIconButtonStyles, ``)}>
            {muted ? <VolumeXMd /> : <VolumeMinMd />}
          </button>
          <button onClick={handleSidebarOpen} className={twMerge(largeIconButtonStyles, ``)}>
            <Expand01Md />
          </button>
        </div>
      )}
    </div>
  )
}

const toolbarContainerStyles = `
  flex
  justify-center
`

const containerStyles = twMerge(
  containerStyles_base,
  `
    border-white/10
    bg-white/10
  `
)

const gridStyles = `
  ${gridStyles_base}
  flex-row flex-row-reverse
  gap-x-3
  px-5 py-1 pl-6
`

const sectionStyles = `
  ${sectionStyles_base}
  
  flex-row
  px-0 pt-2
`

const VideoMenu = () => {
  const DesktopVideo = ({ children }) => (
    <div
      style={{ textShadow: `0 0.03em 0.08em hsla(0, 0%, 0%, 0.4)` }}
      className={`
    flex
    
    h-[9.33rem]
    w-[14rem]

    items-center
    justify-center

    rounded-3xl
    
    border-4
    border-white/80
    
    bg-white/40
    text-2xl
    font-bold
    sm:h-[12rem]
    sm:w-[18rem]
  `}
    >
      {children}
    </div>
  )

  const numVideos = 20

  const [videoProps, setVideoProps] = useState([...Array(numVideos)])

  const [pageIndex, setPageIndex] = useState(0)

  const videoPages = []
  let _page = []

  const maxPageLength = 6

  videoProps.map((__, i) => {
    if (_page.length === maxPageLength) {
      videoPages.push(_page)
      _page = []
    }

    _page.push(i)
  })

  const videos = videoPages[pageIndex].map((num, i) => {
    return <DesktopVideo>{num}</DesktopVideo>
  })

  const numPages = videoPages.length

  return (
    <div
      className={`
    inline-grid
    grid-cols-[min-content]
    justify-center
    gap-y-4
  `}
    >
      <div
        className={`
      inline-grid
      grid-cols-[auto_auto]
      justify-center
      
      gap-4
      sm:gap-6
    `}
      >
        {videos}
      </div>

      <div
        className={`
      flex
      
      items-center
      justify-end
      gap-x-4
      tracking-wide
    `}
      >
        <button
          onClick={() => setPageIndex(pageIndex - 1)}
          className={twMerge(smallIconButtonStyles, pageIndex === 0 ? `hidden` : ``)}
        >
          <ChevronLeftMd />
        </button>
        {`${pageIndex + 1}/${numPages}`}
        <button
          onClick={() => setPageIndex(pageIndex + 1)}
          className={twMerge(smallIconButtonStyles, pageIndex === numPages - 1 ? `hidden` : ``)}
        >
          <ChevronRightMd />
        </button>
      </div>

      <div className={toolbarContainerStyles}>
        <div className={containerStyles}>
          <div className={gridStyles}>
            <div className={sectionStyles}>
              <MultimediaStateProvider>
                <ScreenshareButton />
                <CamButton />
                <MicButton />
              </MultimediaStateProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ViewerInteractions = () => {
  const isPortrait = useIsPortrait()
  const userID = useHookstate(getMutableState(EngineState).userID).value
  const loadingScreenVisible = useHookstate(getMutableState(LoadingSystemState).loadingScreenVisible).value
  const { t } = useTranslation()
  const externalInjectedMenus = useMutableState(ViewerMenuState).externalInjectedMenus.get(NO_PROXY)
  const locationContainer = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (locationContainer.current) locationContainer.current.style.opacity = '0'
  }, [locationContainer])

  const isLoggedIn = !!userID

  if (!isLoggedIn) return null

  const [sidebarKey, setSidebarKey] = useState(``)

  const isSidebarOpen = !!sidebarKey

  const createToggleSidebarKey = (sidebarKey) => () =>
    setSidebarKey((prev) => {
      return prev === sidebarKey ? `` : sidebarKey
    })

  const headings = {
    Chat: `Chat`,
    Video: `Video`,
    Cart: `Cart`,
    Share: `Share`
  }

  const tabs = {
    Chat: [
      {
        heading: `Video`,
        onClick: () => setSidebarKey(`Video`)
      },
      {
        heading: `Chat`,
        onClick: () => setSidebarKey(`Chat`),
        active: true
      }
    ],
    Video: [
      {
        heading: `Video`,
        onClick: () => setSidebarKey(`Video`),
        active: true
      },
      {
        heading: `Chat`,
        onClick: () => setSidebarKey(`Chat`)
      }
    ]
  }

  const contents = {
    Chat: <ChatMenu />,
    Video: <VideoMenu />
  }

  const onMessageClick = createToggleSidebarKey(`Chat`)
  const onShareClick = createToggleSidebarKey(`Share`)
  const onFullscreenVideosClick = createToggleSidebarKey(`Video`)

  const toolbar = <ToolbarMenu onMessageClick={onMessageClick} onShareClick={onShareClick} />

  const sidebarTabs = tabs[sidebarKey] || []
  const sidebarHeading = headings[sidebarKey]
  const sidebarContent = isSidebarOpen && contents[sidebarKey]

  const closeSidebar = () => setSidebarKey(``)

  return (
    <div id="location-container" ref={locationContainer} className="fixed h-dvh w-full">
      <MultiVideos handleSidebarOpen={onFullscreenVideosClick} />

      <ToolbarAndSidebar
        handleSidebarClose={closeSidebar}
        isSidebarOpen={isSidebarOpen}
        content={sidebarContent}
        heading={sidebarHeading}
        tabs={sidebarTabs}
        toolbar={toolbar}
      />

      <ARPlacement />
      <XRLoading />

      <TouchGamepad />
    </div>
  )
}
