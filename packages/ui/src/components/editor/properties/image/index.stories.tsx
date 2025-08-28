import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Properties/Image',
  component: Component,
  parameters: {
    componentSubtitle: 'ImageNodeEditor',
    jest: 'imageNodeEditor.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
