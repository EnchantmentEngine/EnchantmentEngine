import { ArgTypes } from '@storybook/react'

import CalloutText from './index'

const argTypes: ArgTypes = {
  variant: {
    control: 'select',
    options: ['info', 'error', 'success', 'warning']
  }
}

export default {
  title: 'Primitives/Tailwind/CalloutText',
  component: CalloutText,
  parameters: {
    componentSubtitle: 'CalloutText',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = {
  args: {
    variant: 'info',
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh.'
  }
}
