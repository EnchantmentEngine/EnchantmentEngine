import { ArgTypes } from '@storybook/react'
import React, { useState } from 'react'
import Slider, { SliderProps } from './index'

const argTypes: ArgTypes = {
  min: {
    control: 'number'
  },
  max: {
    control: 'number'
  },
  step: {
    control: 'number'
  },
  startingValue: {
    control: 'number'
  },
  label: {
    control: 'text'
  }
}

export default {
  title: 'Components/Editor/Slider',
  component: Slider,
  parameters: {
    componentSubtitle: 'Slider',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=3968-12405&node-type=frame&t=XAGvEGVnphLHTwP3-0'
    }
  },
  argTypes,
  args: {
    startingValue: 40,
    min: 0,
    max: 100,
    step: 0.1,
    label: 'Label'
  }
}

const SliderRenderer = (args: SliderProps & { startingValue: number }) => {
  const [value, setValue] = useState(args.startingValue)
  return <Slider {...args} value={value} onChange={(value) => setValue(value)} onRelease={(value) => setValue(value)} />
}

export const Default = {
  name: 'Default',
  render: SliderRenderer
}
