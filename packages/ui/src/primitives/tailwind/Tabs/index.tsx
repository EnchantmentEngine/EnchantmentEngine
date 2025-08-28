import React, { ReactNode, useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

import { useHookstate } from '@ir-engine/hyperflux'
import Text from '../Text'

export interface TabProps extends React.HTMLAttributes<HTMLDivElement> {
  tabsData: {
    id?: string
    tabLabel: string | ReactNode
    title?: string
    topComponent?: ReactNode
    bottomComponent?: ReactNode
    rightComponent?: ReactNode
    ref?: React.RefObject<HTMLDivElement>
    disabled?: boolean
  }[]
  backgroundTheme?: string
  tabClassName?: string
  scrollable?: boolean
  currentTabIndex?: number
  onTabChange?: (index: number) => void
}

const Tabs = ({
  tabsData,
  tabClassName,
  scrollable,
  currentTabIndex,
  onTabChange,
  ...props
}: TabProps): JSX.Element => {
  const currentTab = useHookstate(0)

  useEffect(() => {
    if (currentTabIndex) {
      currentTab.set(currentTabIndex)
    }
  }, [currentTabIndex])

  useEffect(() => {
    if (
      scrollable &&
      tabsData.length &&
      tabsData[currentTab.value] &&
      tabsData[currentTab.value].ref &&
      tabsData[currentTab.value].ref?.current
    ) {
      tabsData[currentTab.value].ref?.current?.scrollIntoView({
        block: 'center',
        inline: 'nearest',
        behavior: 'smooth'
      })
    }
    if (onTabChange) {
      onTabChange(currentTab.value)
    }
  }, [currentTab])

  return (
    <div className="relative">
      {tabsData[currentTab.value]?.title && (
        <Text fontSize="xl" className="mb-6 text-text-primary">
          {tabsData[currentTab.value]?.title}
        </Text>
      )}
      {tabsData[currentTab.value]?.topComponent}
      <div className={'sticky top-0 z-50 mb-2 flex justify-between rounded-md bg-ui-background px-3 py-2'}>
        {tabsData.map((tab, index) => (
          <button
            key={index}
            className={twMerge(
              'p-3 text-sm text-text-secondary hover:border-b hover:border-b-ui-primary disabled:cursor-not-allowed disabled:opacity-50',
              currentTab.value === index ? 'border-b border-b-ui-select-primary font-semibold ' : '',
              tab.disabled ? 'border-none' : '',
              tabClassName
            )}
            disabled={tab.disabled}
            onClick={() => {
              currentTab.set(index)
            }}
          >
            {tab.tabLabel}
          </button>
        ))}
        {tabsData[currentTab.value]?.rightComponent}
      </div>
      {scrollable ? tabsData.map((tab, index) => tab.bottomComponent) : tabsData[currentTab.value]?.bottomComponent}
    </div>
  )
}

export default Tabs
