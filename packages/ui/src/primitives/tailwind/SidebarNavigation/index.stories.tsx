import { useHookstate } from '@ir-engine/hyperflux'
import React from 'react'
import { User01Lg } from '../../../icons'
import Component from './index'

const argTypes = {
  displayMode: {
    control: 'inline-radio',
    options: ['justify-start', 'justify-between']
  }
}

export default {
  title: 'Primitives/Tailwind/SidebarNavigation',
  component: Component,
  parameters: {
    componentSubtitle: 'SidebarNavigation',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes: argTypes
}

const Renderer = (args) => {
  const currentTabIndex = useHookstate(0)

  const onChange = (tabIndex: number) => {
    currentTabIndex.set(tabIndex)
  }

  return (
    <Component
      labels={args.labels}
      currentTabIndex={currentTabIndex.value}
      onChange={onChange}
      displayMode={args.displayMode}
    />
  )
}

export const Default = {
  args: {
    labels: ['Profile', 'My Account']
  },
  render: Renderer
}

export const WithIcons = {
  args: {
    labels: [
      <>
        <User01Lg className="h-6 w-6" />
        <span>Profile</span>
      </>,
      <>
        <User01Lg className="h-6 w-6" />
        <span>My Account</span>
      </>
    ]
  },
  render: Renderer
}
