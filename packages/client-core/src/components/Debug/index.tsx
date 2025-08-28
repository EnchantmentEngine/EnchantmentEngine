import {
  defineState,
  getMutableState,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import Tabs, { TabProps } from '@ir-engine/ui/src/primitives/tailwind/Tabs'
import React, { useEffect } from 'react'
import { useDraggable } from '../../hooks/useDraggable'
import { APIDebug } from './APIDebug'
import DebugButtons from './DebugButtons'
import { EntityDebug } from './EntityDebug'
import { ReactorDebug } from './ReactorDebug'
import { ResourceDebug } from './ResourceDebug'
import { StateDebug } from './StateDebug'
import { StatsPanel } from './StatsPanel'
import { SystemDebug } from './SystemDebug'

function Placer({ id }: { id: string }) {
  return (
    <div id={id} className="flex flex-col gap-0.5 px-2 py-1">
      <div className="h-0.5 w-full bg-[#2B2C30]" />
      <div className="h-0.5 w-full bg-[#2B2C30]" />
    </div>
  )
}

export const DebugState = defineState({
  name: 'DebugState',
  initial: {
    enabled: false,
    activeTabIndex: 0
  },
  extension: syncStateWithLocalStorage(['enabled', 'activeTabIndex'])
})

const DebugTabs = {
  None: <></>,
  All: (
    <>
      <EntityDebug />
      <APIDebug />
      <SystemDebug />
      <StateDebug />
      <ResourceDebug />
    </>
  ),
  Entities: <EntityDebug />,
  API: <APIDebug />,
  Systems: <SystemDebug />,
  State: <StateDebug />,
  Reactor: <ReactorDebug />,
  Resources: <ResourceDebug />
}

const tabsData: TabProps['tabsData'] = Object.keys(DebugTabs).map((tabLabel) => ({
  tabLabel,
  bottomComponent: DebugTabs[tabLabel]
}))

const Debug = () => {
  const activeTabIndex = useMutableState(DebugState).activeTabIndex

  useDraggable({
    targetId: 'debug',
    placerId: 'debug-placer'
  })

  return (
    <div id="debug" className="pointer-events-auto fixed z-[1000] max-w-[600px] rounded bg-neutral-700 p-0.5">
      <Placer id="debug-placer" />
      <div className="m-1 max-h-[95vh] overflow-y-auto">
        <DebugButtons />
        <StatsPanel show />
        <Tabs
          tabsData={tabsData}
          currentTabIndex={activeTabIndex.value}
          onTabChange={(tabIndex) => activeTabIndex.set(tabIndex)}
        />
      </div>
    </div>
  )
}

export const DebugToggle = () => {
  const isShowing = useHookstate(getMutableState(DebugState).enabled)

  useEffect(() => {
    function downHandler({ keyCode }) {
      if (keyCode === 192) {
        isShowing.set(!isShowing.value)
      }
    }
    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [])

  return isShowing.value ? <Debug /> : <></>
}

export default DebugToggle
