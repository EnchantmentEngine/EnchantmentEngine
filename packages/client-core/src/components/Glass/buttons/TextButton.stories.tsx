import type { Meta, StoryObj } from '@storybook/react'

import { distanceVariant, fadeVariant } from './Button.styles'
import { TextButton as Component } from './TextButton'

const meta: Meta<typeof Component> = {
  title: 'Components/Buttons/TextButton',
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
    disabled: false,
    fade: 'light' as keyof typeof fadeVariant,
    distance: 'low' as keyof typeof distanceVariant,
    children: 'Button Text'
  }
}

export const Darker: Story = {
  args: {
    disabled: false,
    fade: 'darker' as keyof typeof fadeVariant,
    distance: 'low' as keyof typeof distanceVariant,
    children: 'Some dark button'
  }
}

export const Dark: Story = {
  args: {
    disabled: false,
    fade: 'dark' as keyof typeof fadeVariant,
    distance: 'low' as keyof typeof distanceVariant,
    children: 'Some dark button'
  }
}

export const Clear: Story = {
  args: {
    disabled: false,
    fade: 'clear' as keyof typeof fadeVariant,
    distance: 'none' as keyof typeof distanceVariant,
    children: 'Cancel',
    className: 'w-full'
  }
}

export const Light: Story = {
  args: {
    disabled: false,
    fade: 'light' as keyof typeof fadeVariant,
    distance: 'low' as keyof typeof distanceVariant,
    children: 'Some dark button'
  }
}

export const Lighter: Story = {
  args: {
    disabled: false,
    fade: 'lighter' as keyof typeof fadeVariant,
    distance: 'low' as keyof typeof distanceVariant,
    children: 'Some dark button'
  }
}

export const CopyDirectLink: Story = {
  args: {
    disabled: false,
    fade: 'lighter' as keyof typeof fadeVariant,
    distance: 'none' as keyof typeof distanceVariant,
    children: 'Copy Direct Link',
    className: 'w-full'
  }
}
