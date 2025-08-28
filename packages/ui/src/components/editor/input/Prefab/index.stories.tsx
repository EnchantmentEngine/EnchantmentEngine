import Component from './index'

const argTypes = {}

export default {
  title: 'Editor/Input/Prefab',
  component: Component,
  parameters: {
    componentSubtitle: 'PrefabInput',
    jest: 'Prefab.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}
export const Default = { args: Component.defaultProps }
