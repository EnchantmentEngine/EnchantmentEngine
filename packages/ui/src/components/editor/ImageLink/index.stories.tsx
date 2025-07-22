import { useArgs } from '@storybook/preview-api'
import { ArgTypes } from '@storybook/react'
import React from 'react'
import ImageLink, { ImageLinkProps } from './index'

const argTypes: ArgTypes = {
  src: {
    control: 'text'
  },
  variant: {
    control: 'inline-radio',
    options: ['sm', 'md', 'lg', 'full']
  },
  previewOnly: {
    control: 'boolean'
  }
}

export default {
  title: 'Components/Editor/ImageLink',
  component: ImageLink,
  parameters: {
    componentSubtitle: 'ImageLink',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/ln2VDACenFEkjVeHkowxyi/iR-Engine-Design-Library-File?node-id=2370-20234&node-type=frame&t=dEsGEixZxXD7JCWh-0'
    }
  },
  argTypes,
  args: {
    src: '',
    variant: 'md'
  }
}

const ImageLinkRenderer = (args: ImageLinkProps & { previewOnly: boolean }) => {
  const [_currentArgs, updateArgs] = useArgs<{ src: string }>()
  return <ImageLink {...args} onChange={args.previewOnly ? undefined : (value) => updateArgs({ src: value })} />
}

export const Default = {
  name: 'Default',
  render: ImageLinkRenderer
}
