import { EngineState } from '@ir-engine/ecs'
import { getMutableState, UserID } from '@ir-engine/hyperflux'
import type { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import SettingsMenu, { screens } from '.'
import { ViewerInteractions } from '../Glass'

const meta = {
  title: 'Viewer/Toolbar',
  component: SettingsMenu,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A settings menu component with iPhone-like slide transitions between screens.'
      }
    }
  },
  tags: ['autodocs'],
  globals: {
    screen: 'main'
  },
  args: {
    initScreen: 'main'
  },
  argTypes: {
    onClose: { action: 'closed' },
    initScreen: {
      control: 'select',
      options: Object.keys(screens)
    }
  }
} satisfies Meta<typeof SettingsMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  globals: {
    backgrounds: { value: 'rgb(30 30 30)' }
  },
  render: () => {
    getMutableState(EngineState).userID.set('1' as UserID)
    useEffect(() => {
      const el = document.getElementById('location-container')
      if (el) el.style.opacity = '1'
    }, [])

    return <ViewerInteractions />
  }
}
