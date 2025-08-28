import AvatarImage from './index'

export default {
  title: 'Primitives/Tailwind/AvatarImage',
  component: AvatarImage,
  parameters: {
    componentSubtitle: 'AvatarImage',
    jest: 'AvatarImage.test.tsx',
    design: {
      type: 'figma',
      url: ''
    },
    chromatic: { disable: true }
  }
}

export const Default = {
  args: {
    src: ''
  }
}
