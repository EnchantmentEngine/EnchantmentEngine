import { ArgTypes } from '@storybook/react'

import DragNDrop from './index'

const argTypes: ArgTypes = {}

export default {
  title: 'Primitives/Tailwind/DragNDrop',
  component: DragNDrop,
  parameters: {
    componentSubtitle: 'DragNDrop',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = {
  args: {
    className: ''
  }
}
