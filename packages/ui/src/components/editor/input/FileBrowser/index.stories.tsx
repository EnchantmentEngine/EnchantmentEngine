import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/FileBrowser',
  component: Component,
  parameters: {
    componentSubtitle: 'FileBrowserInput',
    jest: 'FileBrowser.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
