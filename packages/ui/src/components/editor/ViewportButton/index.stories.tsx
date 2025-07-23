import { ArgTypes, StoryObj } from '@storybook/react'
import React from 'react'

import { RulerUnitsMd } from '@ir-engine/ui/src/icons'
import ViewportButton, { ViewportButtonProps } from './index'

const argTypes: ArgTypes = {
  selected: {
    control: 'boolean'
  }
}

export default {
  title: 'Components/Editor/ViewportButton',
  component: ViewportButton,
  parameters: {
    componentSubtitle: 'ViewportButton',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2276-16114&node-type=frame&m=dev'
    }
  },
  argTypes
}

type Story = StoryObj<typeof ViewportButton>

const ViewportButtonRenderer = (args: ViewportButtonProps) => {
  return <ViewportButton {...args} icon={RulerUnitsMd} />
}

export const Default: Story = {
  name: 'Primary',
  args: {},
  render: ViewportButtonRenderer
}
