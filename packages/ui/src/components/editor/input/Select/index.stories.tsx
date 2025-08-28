import SelectInput from './index'
const argTypes = {}

export default {
  title: 'Editor/Input/Select',
  component: SelectInput,
  parameters: {
    componentSubtitle: 'SelectInput',
    jest: 'Select.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
}

export const Default = { args: SelectInput.defaultProps }
