import { useArgs } from '@storybook/preview-api'
import { ArgTypes } from '@storybook/react'
import React from 'react'
import Seeker, { SeekerProps } from './index'

const argTypes: ArgTypes = {
  currentSeconds: {
    control: 'number',
    name: 'Starting Seconds'
  },
  totalSeconds: {
    control: 'number',
    name: 'Total Seconds'
  },
  isPaused: {
    control: 'boolean',
    name: 'Is Paused'
  }
}

export default {
  title: 'Components/Editor/Seeker',
  component: Seeker,
  parameters: {
    componentSubtitle: 'Seeker',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2283-24252&node-type=frame&t=XAGvEGVnphLHTwP3-0'
    }
  },
  argTypes,
  args: {
    startingSeconds: 40,
    totalSeconds: 9960,
    isPaused: false
  }
}

const SeekerRenderer = (args: SeekerProps & { startingSeconds: number }) => {
  const [currentArgs, updateArgs] = useArgs<{ startingSeconds: number }>()
  return (
    <Seeker
      {...args}
      currentSeconds={currentArgs.startingSeconds}
      onChange={(startingSeconds) => updateArgs({ startingSeconds })}
    />
  )
}

export const Default = {
  name: 'Default',
  render: SeekerRenderer
}
