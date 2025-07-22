import { useArgs } from '@storybook/preview-api'
import { ArgTypes } from '@storybook/react'
import React from 'react'
import Checkbox, { CheckboxProps } from './index'

const argTypes: ArgTypes = {
  checked: {
    control: 'boolean'
  },
  disabled: {
    control: 'boolean'
  },
  indeterminate: {
    control: 'boolean'
  },
  label: {
    control: 'text',
    if: { arg: 'label', exists: true }
  },
  description: {
    control: 'text',
    if: { arg: 'description', exists: true }
  },
  variantSize: {
    name: 'size',
    control: 'inline-radio',
    options: ['md', 'lg']
  },
  variantTextPlacement: {
    name: 'Text Placement',
    control: 'inline-radio',
    options: ['left', 'right']
  }
}

export default {
  title: 'Primitives/Tailwind/Checkbox',
  component: Checkbox,
  parameters: {
    componentSubtitle: 'Checkbox',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2786-21102&node-type=frame&t=TlQtKBH49KjD5Efr-0'
    }
  },
  argTypes,
  args: {
    variantSize: 'md',
    variantTextPlacement: 'right'
  }
}

const CheckboxRenderer = (args: CheckboxProps) => {
  const [, updateArgs] = useArgs<{ checked: boolean }>()

  return (
    <div className="flex items-center gap-3">
      <Checkbox {...args} onChange={(checked) => updateArgs({ checked })} />
    </div>
  )
}

export const Default = {
  name: 'Default',
  render: CheckboxRenderer
}

export const WithLabel = {
  name: 'With Label',
  render: CheckboxRenderer,
  args: {
    label: 'Checkbox label'
  }
}

export const WithDescription = {
  name: 'With Description',
  render: CheckboxRenderer,
  args: {
    label: 'Checkbox label',
    description: 'Save my login details for next time.'
  }
}
