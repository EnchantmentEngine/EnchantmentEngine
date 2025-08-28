import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/Folder',
  component: Component,
  parameters: {
    componentSubtitle: 'FolderInput',
    jest: 'Folder.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
