import type { Meta, StoryObj } from '@storybook/react'

import { Badge as Component } from './Badge'

const meta: Meta<typeof Component> = {
  title: 'Components/Badge',
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
    number: 5,
    position: 'top' as 'bottom' | 'top',
    show: true
  }
}
