import image from '../../../../../../../PoweredByIR.png'
import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/Texture',
  component: Component,
  parameters: {
    componentSubtitle: 'TextureInput',
    jest: 'Texture.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = {
  args: {
    value: image
  }
}
