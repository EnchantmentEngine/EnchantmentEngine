import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/Euler',
  component: Component,
  parameters: {
    componentSubtitle: 'EulerInput',
    jest: 'Euler.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
