import { Globe01Sm, HelpIconSm } from '@ir-engine/ui/src/icons'
import { ArgTypes, StoryFn } from '@storybook/react'
import React from 'react'
import Input, { InputProps } from './index'

const sizes: InputProps['height'][] = ['xs', 'l', 'xl']

const argTypes: ArgTypes = {
  size: {
    control: {
      type: 'select'
    },
    options: sizes
  },
  fullWidth: {
    control: {
      type: 'boolean'
    }
  },
  state: {
    control: {
      type: 'select'
    },
    options: ['success', 'error']
  },
  disabled: {
    control: {
      type: 'boolean'
    }
  },
  helperText: {
    control: {
      type: 'text'
    }
  },
  labelText: {
    control: {
      type: 'text'
    }
  },
  labelPosition: {
    control: {
      type: 'select'
    },
    options: ['top', 'left']
  },
  infoText: {
    control: {
      type: 'text'
    }
  },
  required: {
    control: {
      type: 'boolean'
    }
  }
}

export default {
  title: 'Primitives/Tailwind/Input',
  component: Input,
  parameters: {
    componentSubtitle: 'Input',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2105-17763'
    }
  },
  argTypes: argTypes
}

const Template: StoryFn = (args) => {
  // @ts-ignore
  const updatedArgs: InputProps = {
    ...args,
    labelProps: {
      text: args.labelText,
      position: args.labelPosition,
      infoText: args.infoText
    }
  }
  const [value, setValue] = React.useState(args.value)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }
  return (
    <div className="grid h-[50vh] w-full place-items-center rounded border border-gray-300 p-5">
      <Input {...updatedArgs} value={value} onChange={handleChange} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = {
  value: 'ir@infinityreality.com',
  placeholder: 'Email Address',
  size: 'l'
}

export const FullWidth = Template.bind({})
FullWidth.args = {
  value: 'ir@infinityreality.com',
  fullWidth: true,
  placeholder: 'Email Address',
  size: 'l'
}

export const InputWithLeadingIcon = Template.bind({})
InputWithLeadingIcon.args = {
  value: 'ir@infinityreality.com',
  placeholder: 'Email Address',
  startComponent: <Globe01Sm />,
  size: 'l'
}

export const InputWithTrailingIcon = Template.bind({})
InputWithTrailingIcon.args = {
  value: 'ir@infinityreality.com',
  placeholder: 'Email Address',
  endComponent: (
    <button>
      <HelpIconSm />
    </button>
  ),
  size: 'l'
}

export const InputWithBothIcons = Template.bind({})
InputWithBothIcons.args = {
  value: 'ir@infinityreality.com',
  placeholder: 'Email Address',
  startComponent: <Globe01Sm />,
  endComponent: (
    <button>
      <HelpIconSm />
    </button>
  ),
  size: 'l'
}
