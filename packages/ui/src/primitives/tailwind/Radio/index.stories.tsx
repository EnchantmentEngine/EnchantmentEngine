import { ArgTypes } from '@storybook/react'
import React, { useEffect, useState } from 'react'
import RadioGroup, { RadioProps } from './index'

const argTypes: ArgTypes = {
  disabled: {
    control: 'boolean'
  },
  selected: {
    control: 'boolean',
    name: 'Initially selected'
  },
  label: {
    control: 'text'
  },
  description: {
    control: 'text'
  },
  horizontal: {
    control: 'boolean'
  },
  numberOfRadios: {
    control: 'number',
    name: 'Number of Radios',
    description: 'The number of radios to generate'
  },
  variant: {
    control: 'select',
    options: ['sm', 'md']
  }
}

export default {
  title: 'Primitives/Tailwind/Radio',
  component: RadioGroup,
  parameters: {
    componentSubtitle: 'Radio',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2786-21237&node-type=frame&t=n2wfUzH1bzwYsyob-0'
    }
  },
  argTypes,
  args: {
    numberOfRadios: 1,
    variant: 'sm'
  }
}

const RadioGroupRenderer = ({
  description,
  label,
  disabled,
  numberOfRadios,
  horizontal,
  selected,
  variant
}: Pick<RadioProps, 'description' | 'label' | 'disabled' | 'variant'> & {
  numberOfRadios: number
  horizontal: boolean
  selected: boolean
}) => {
  const options =
    numberOfRadios > 1
      ? Array.from({ length: numberOfRadios }, (_, idx) => ({
          label: label && `${label} ${idx + 1}`,
          description: description && `${description} ${idx + 1}`,
          value: `${idx + 1}`
        }))
      : [{ label, description, value: '1' }]

  const [value, setValue] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (selected) {
      setValue(options[0].value)
    }
  }, [selected])

  return (
    <RadioGroup
      variant={variant}
      options={options}
      value={value}
      onChange={(v) => setValue(v)}
      disabled={disabled}
      horizontal={horizontal}
    />
  )
}

export const Default = {
  name: 'Default',
  render: RadioGroupRenderer
}

export const WithDescription = {
  name: 'With Description',
  render: RadioGroupRenderer,
  args: {
    label: 'Remember me',
    description: 'Save my login details for next time'
  }
}
