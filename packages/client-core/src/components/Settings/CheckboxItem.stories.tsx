import { useArgs } from '@storybook/preview-api'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import CheckboxItem from './CheckboxItem'

interface CheckboxItemProps {
  label?: string
  checked?: boolean
  onClick?: () => void
  disabled?: boolean
}

const meta = {
  title: 'Components/Checkbox',
  component: CheckboxItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A checkbox item component for settings screens with smooth animations and consistent styling.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label text for the checkbox'
    },
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled'
    },
    onClick: {
      action: 'clicked',
      description: 'Callback function when checkbox is clicked'
    }
  },
  args: {
    label: 'I agree to the Infinite Reality Terms of Service',
    checked: false,
    disabled: false
  }
} satisfies Meta<typeof CheckboxItem>

export default meta
type Story = StoryObj<typeof meta>

const CheckboxItemRenderer = (args: CheckboxItemProps) => {
  const [currentArgs, updateArgs] = useArgs<{ checked: boolean }>()

  return (
    <div className="w-96 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 p-4">
      <CheckboxItem
        {...args}
        checked={currentArgs.checked}
        onClick={() => updateArgs({ checked: !currentArgs.checked })}
      />
    </div>
  )
}

export const Default: Story = {
  name: 'Default',
  render: CheckboxItemRenderer
}
