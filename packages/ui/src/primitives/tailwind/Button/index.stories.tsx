import { ArgTypes, StoryObj } from '@storybook/react'
import React from 'react'

import { HiOutlineMail } from 'react-icons/hi'
import Button, { ButtonProps } from './index'

const sizes: ButtonProps['size'][] = ['xs', 'sm', 'l', 'xl']

const argTypes: ArgTypes = {
  disabled: {
    control: 'boolean'
  },
  startIcon: {
    control: 'boolean',
    name: 'Start Icon'
  },
  endIcon: {
    control: 'boolean',
    name: 'End Icon'
  },
  variant: {
    table: { disable: true }
  }
}

export default {
  title: 'Primitives/Tailwind/Button',
  component: Button,
  parameters: {
    componentSubtitle: 'Button',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2035-16950'
    }
  },
  argTypes
}

type Story = StoryObj<typeof Button>

const ButtonRenderer = (
  args: ButtonProps & {
    startIcon?: boolean
    endIcon?: boolean
  }
) => {
  return (
    <div className="flex items-center gap-3">
      {sizes.map((size) => (
        <div className="flex grow flex-col items-center">
          <span className="mb-2 text-sm text-blue-400">{size}</span>
          <Button key={size} size={size} {...args}>
            {args.startIcon && <HiOutlineMail />}
            {args.children}
            {args.endIcon && <HiOutlineMail />}
          </Button>
        </div>
      ))}
    </div>
  )
}

export const Default: Story = {
  name: 'Primary',
  args: {
    children: 'Label',
    variant: 'primary'
  },
  render: ButtonRenderer
}

export const Secondary: Story = {
  args: {
    children: 'Label',
    variant: 'secondary'
  },
  render: ButtonRenderer
}

export const Tertiary: Story = {
  name: 'Tertiary',
  args: {
    children: 'Label',
    variant: 'tertiary'
  },
  render: ButtonRenderer
}

export const Green: Story = {
  args: {
    children: 'Label',
    variant: 'green'
  },
  render: ButtonRenderer
}

export const Red: Story = {
  args: {
    children: 'Label',
    variant: 'red'
  },
  render: ButtonRenderer
}
