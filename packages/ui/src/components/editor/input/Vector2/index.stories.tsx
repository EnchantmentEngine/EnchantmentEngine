import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/Vector2',
  component: Component,
  parameters: {
    componentSubtitle: 'Vector2Input',
    jest: 'Vector2.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = { args: Component.defaultProps }
