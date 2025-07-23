import { EyeSm, Lock01Sm } from '@ir-engine/ui/src/icons'
import { useArgs } from '@storybook/preview-api'
import { ArgTypes } from '@storybook/react'
import React from 'react'
import EditorDropdownItem, { EditorDropdownItemProps } from './index'

const argTypes: ArgTypes = {
  label: {
    control: 'text'
  },
  selected: {
    control: 'boolean'
  },
  disabled: {
    control: 'boolean'
  },
  rightIcon1: {
    name: 'Right Icon 1',
    control: 'boolean'
  },
  rightIcon2: {
    name: 'Right Icon 2',
    control: 'boolean'
  }
}

export default {
  title: 'Components/Editor/EditorDropdownItem',
  component: EditorDropdownItem,
  parameters: {
    componentSubtitle: 'EditorDropdownItem',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2504-5037&node-type=frame&t=kvvxZyxXfr04QgeG-0'
    }
  },
  argTypes,
  args: {
    label: 'Label',
    selected: false
  }
}

const EditorDropdownItemRenderer = (args: EditorDropdownItemProps & { rightIcon1?: boolean; rightIcon2?: boolean }) => {
  const [currentArgs, updateArgs] = useArgs<{ selected: boolean }>()
  return (
    <EditorDropdownItem
      {...args}
      selected={currentArgs.selected}
      onClick={() => updateArgs({ selected: !currentArgs.selected })}
      RightIcon1={args.rightIcon1 && (Lock01Sm as any)}
      RightIcon2={args.rightIcon2 && (EyeSm as any)}
    />
  )
}

export const Default = {
  name: 'Default',
  render: EditorDropdownItemRenderer
}
