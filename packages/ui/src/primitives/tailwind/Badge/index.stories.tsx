import Badge from './index'

export default {
  title: 'Primitives/Tailwind/Badge',
  component: Badge,
  parameters: {
    componentSubtitle: 'Badge',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes: {
    variant: {
      control: {
        type: 'select'
      },
      options: ['success', 'successLight', 'danger', 'neutral', 'warning']
    }
  }
}

export const Default = {
  args: {
    label: 'Badge',
    variant: 'warning'
  }
}
