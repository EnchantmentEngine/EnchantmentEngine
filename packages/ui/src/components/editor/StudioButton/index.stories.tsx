import { ArgTypes, StoryObj } from '@storybook/react'
import React from 'react'

import { SquareSm } from '@ir-engine/ui/src/icons'
import StudioButton, { StudioButtonProps } from './index'

const sizes: StudioButtonProps['size'][] = ['xs', 'sm', 'l', 'xl']

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
  },
  rounded: {
    control: 'boolean'
  }
}

export default {
  title: 'Components/Editor/StudioButton',
  component: StudioButton,
  parameters: {
    componentSubtitle: 'StudioButton',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=3550-14509&node-type=symbol&m=dev'
    }
  },
  argTypes
}

type Story = StoryObj<typeof StudioButton>

const StudioButtonRenderer = (
  args: StudioButtonProps & {
    startIcon?: boolean
    endIcon?: boolean
  }
) => {
  return (
    <div className="flex items-center gap-3">
      {sizes.map((size) => (
        <div className="flex grow flex-col items-center">
          <span className="mb-2 text-sm text-sky-600">{size}</span>
          <StudioButton key={size} size={size} {...args}>
            {args.startIcon && <SquareSm />}
            {args.children}
            {args.endIcon && <SquareSm />}
          </StudioButton>
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
  render: StudioButtonRenderer
}

export const Secondary: Story = {
  args: {
    children: 'Label',
    variant: 'secondary'
  },
  render: StudioButtonRenderer
}

export const Tertiary: Story = {
  name: 'Tertiary',
  args: {
    children: 'Label',
    variant: 'tertiary'
  },
  render: StudioButtonRenderer
}
