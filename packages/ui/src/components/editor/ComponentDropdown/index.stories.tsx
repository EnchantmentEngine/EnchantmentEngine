import { useArgs } from '@storybook/preview-api'
import { ArgTypes } from '@storybook/react'
import React from 'react'
import ComponentDropdown, { ComponentDropdownProps } from './index'

const argTypes: ArgTypes = {
  name: {
    control: 'text'
  },
  description: {
    control: 'text'
  },
  minimizedDefault: {
    control: 'boolean'
  },
  closed: {
    control: 'boolean'
  }
}

export default {
  title: 'Components/Editor/ComponentDropdown',
  component: ComponentDropdown,
  parameters: {
    componentSubtitle: 'ComponentDropdown',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2975-8101&node-type=frame&t=dEsGEixZxXD7JCWh-0'
    },
    chromatic: { disable: true }
  },
  argTypes,
  args: {
    name: 'Label',
    description: 'A 3d model in your scene, loaded from a gltf url or file.',
    minimizedDefault: true
  }
}

const ImageLinkRenderer = (args: ComponentDropdownProps) => {
  const [currentArgs, updateArgs] = useArgs<{ closed: boolean }>()
  if (currentArgs.closed) {
    return <button onClick={() => updateArgs({ closed: false })}>click to show component again</button>
  }
  return (
    <ComponentDropdown
      {...args}
      children={<div className="h-20 bg-sky-800" />}
      onClose={() => updateArgs({ closed: true })}
    />
  )
}

export const Default = {
  name: 'Default',
  render: ImageLinkRenderer
}
