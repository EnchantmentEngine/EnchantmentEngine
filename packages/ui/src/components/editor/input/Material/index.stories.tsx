import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/Material',
  component: Component,
  parameters: {
    componentSubtitle: 'MaterialInput',
    jest: 'Material.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
