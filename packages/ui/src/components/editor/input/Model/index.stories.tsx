import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/Model',
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
