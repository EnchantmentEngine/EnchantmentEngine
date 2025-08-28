import React from 'react'
import { HiMiniRocketLaunch } from 'react-icons/hi2'
import { DropdownItem, DropdownItemProps } from './index'

export default {
  title: 'Primitives/Tailwind/Dropdown Item',
  parameters: {
    componentSubtitle: 'Dropdown',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2511-3503&node-type=frame&t=B0cD28zTLRN51Vxd-0'
    }
  }
}

const DropdownItemRenderer = (args: DropdownItemProps) => {
  let Icon: (() => JSX.Element) | undefined = undefined
  if (!args.Icon) {
    Icon = HiMiniRocketLaunch as () => JSX.Element
    delete args.Icon
  }
  return <DropdownItem Icon={Icon} {...args} />
}

export const DropdownItemStory = {
  render: DropdownItemRenderer,
  args: {
    label: 'Account settings',
    selected: false
  },
  argTypes: {
    secondaryText: {
      control: 'text'
    }
  }
}
