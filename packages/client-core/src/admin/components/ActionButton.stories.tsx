import { PlusLg } from '@ir-engine/ui/src/icons'
import type { Meta } from '@storybook/react'
import ActionButton from './ActionButton'

const meta: Meta<typeof ActionButton> = {
  title: 'Client/ActionButton',
  component: ActionButton,
  parameters: {
    componentSubtitle: 'ActionButton',
    design: {
      type: 'figma',
      url: ''
    }
  }
}
export default meta

export const Default = {
  args: {
    icon: PlusLg,
    variant: 'default',
    'aria-label': 'Add item'
  }
}
