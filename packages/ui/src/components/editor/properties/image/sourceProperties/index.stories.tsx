import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Properties/Image/SourceProperties',
  component: Component,
  parameters: {
    componentSubtitle: 'ImageSourcePropertiesEditor',
    jest: 'imageNodeEditor.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
