import StringInput from './index'
const argTypes = {}

export default {
  title: 'Editor/Input/String',
  component: StringInput,
  parameters: {
    componentSubtitle: 'StringInput',
    jest: 'String.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = { args: StringInput.defaultProps }
