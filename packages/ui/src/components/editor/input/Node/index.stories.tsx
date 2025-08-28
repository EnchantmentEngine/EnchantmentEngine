import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Node',
  component: Component,
  parameters: {
    componentSubtitle: 'ModelInput',
    jest: 'Model.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
