import Text from './index'

export default {
  title: 'Primitives/Tailwind/Text',
  component: Text,
  parameters: {
    componentSubtitle: 'Text',
    jest: 'Text.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    children: 'This is what Text will look like'
  }
}
