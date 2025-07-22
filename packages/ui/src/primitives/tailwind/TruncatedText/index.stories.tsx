import { ArgTypes } from '@storybook/react'
import React from 'react'

import TruncatedText from './index'

const argTypes: ArgTypes = {}

const TruncatedTextStory = (id: string) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <TruncatedText text={id} />
    </div>
  )
}

export default {
  title: 'Primitives/Tailwind/TruncatedText',
  component: TruncatedTextStory,
  parameters: {
    componentSubtitle: 'TruncatedText',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = {
  args: {
    id: '60fc7eab-792a-483f-bbb9-f5b1ec7b98ea'
  }
}
