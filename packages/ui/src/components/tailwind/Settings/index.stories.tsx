import Component from './index'

const argTypes = {}

export default {
  title: 'Capture/Settings',
  component: Component,
  parameters: {
    componentSubtitle: 'Settings',
    jest: 'Settings.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
