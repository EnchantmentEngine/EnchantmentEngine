import { CogMd, ShoppingBag03Lg } from '@ir-engine/ui/src/icons'
import React from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { EmoteM as EmoteIcon } from '@ir-engine/ui/src/icons'
import { BsChatLeftTextFill as MessageIcon } from 'react-icons/bs'
import { IoSettingsSharp as SettingsIcon } from 'react-icons/io5'
import { RiShareForwardFill as ShareIcon } from 'react-icons/ri'

import {
  BsCameraVideoOffFill as CameraOffIcon,
  BsCameraVideoFill as CameraOnIcon,
  BsMicMuteFill as MicrophoneOffIcon,
  BsMicFill as MicrophoneOnIcon
} from 'react-icons/bs'
import { twMerge } from 'tailwind-merge'
import { EmoteMenu } from '../EmoteMenu'
import { containerStyles, gridStyles_base, sectionStyles_base } from '../ToolbarMenu'
import { MenuIconButton as Component } from './MenuIconButton'
const meta: Meta<typeof Component> = {
  title: 'Components/Buttons/MenuIconButton',
  component: Component,
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}
export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    active: false,
    loading: false,
    children: <ShoppingBag03Lg />
  }
}

export const WithBadge: Story = {
  args: {
    active: false,
    loading: false,
    badge: {
      number: 5,
      show: true
    },
    children: <CogMd />
  }
}

const verticalGridStyles = twMerge(
  gridStyles_base,
  `
  flex-col
  py-4
`
)

const horizontalGridStyles = twMerge(
  gridStyles_base,
  `
  flex-row
  flex-row-reverse
  px-5 py-1 pl-6
`
)

const verticalSectionStyles = twMerge(
  sectionStyles_base,
  `
  inline-flex origin-bottom flex-col
  items-center
  px-3
`
)

const horizontalSectionStyles = twMerge(
  sectionStyles_base,
  `
  inline-flex
  origin-left
  
  flex-row
  items-center
  px-0
`
)

export const ToolbarVertical: Story = {
  render: () => {
    return (
      <>
        <div className={`flex gap-4 p-4`}>
          <div className={containerStyles}>
            <div className={verticalGridStyles}>
              <div className={verticalSectionStyles}>
                <Component>
                  <EmoteIcon />
                </Component>
                <Component>
                  <ShareIcon />
                </Component>
                <Component badge={{ number: 3, show: true, position: 'top' }}>
                  <SettingsIcon />
                </Component>
                <Component>
                  <CameraOffIcon />
                </Component>
                <Component>
                  <MicrophoneOffIcon />
                </Component>
                <Component>
                  <MessageIcon />
                </Component>
              </div>
            </div>
          </div>
          <div className={containerStyles}>
            <div className={verticalGridStyles}>
              <div className={verticalSectionStyles}>
                <Component>
                  <EmoteIcon />
                </Component>
                <Component>
                  <ShareIcon />
                </Component>
                <Component>
                  <SettingsIcon />
                </Component>
                <Component>
                  <CameraOnIcon />
                </Component>
                <Component>
                  <MicrophoneOnIcon />
                </Component>
                <Component>
                  <MessageIcon />
                </Component>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export const ToolbarHorizontal: Story = {
  render: () => {
    return (
      <>
        <div className={`flex gap-4 p-4`}>
          <div className={containerStyles}>
            <div className={horizontalGridStyles}>
              <div className={horizontalSectionStyles}>
                <Component badge={{ number: 5, show: true, position: 'top' }}>
                  <EmoteIcon />
                </Component>
                <Component>
                  <CameraOnIcon />
                </Component>
                <Component>
                  <MicrophoneOnIcon />
                </Component>
                <Component>
                  <MessageIcon />
                </Component>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export const ToolbarEmote: Story = {
  render: () => {
    return (
      <>
        <div className={`flex gap-4 p-4`}>
          <div className={containerStyles}>
            <div className={horizontalGridStyles}>
              <div className={horizontalSectionStyles}>
                <EmoteMenu />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}
