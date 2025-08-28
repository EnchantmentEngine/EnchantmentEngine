import { ArgTypes } from '@storybook/react'
import React from 'react'

import Button from '../Button'
import Tooltip, { TooltipProps } from './index'

const argTypes: ArgTypes = {
  title: {
    control: 'text'
  },
  content: {
    control: 'text'
  },
  position: {
    control: 'select',
    options: ['auto', 'top', 'bottom', 'left', 'right']
  }
}

const TooltipStory = (props: TooltipProps) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Tooltip {...props}>
        <Button>Test Submit</Button>
      </Tooltip>
    </div>
  )
}

export default {
  title: 'Primitives/Tailwind/Tooltip',
  component: TooltipStory,
  parameters: {
    componentSubtitle: 'Button',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = {
  args: {
    title: 'Tooltip',
    content: 'I am a tooltip 🚀',
    position: 'right'
  }
}
