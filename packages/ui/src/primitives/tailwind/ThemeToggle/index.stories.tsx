import Component from './index'

export default {
  title: 'Primitives/Tailwind/ThemeToggle',
  component: Component,
  parameters: {
    componentSubtitle: 'ThemeToggle',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const LightMode = {
  args: {
    label: 'Light Mode',
    value: false,
    onChange: () => {},
    disabled: false
  }
}

export const DarkMode = {
  args: {
    label: 'Dark Mode',
    value: true,
    onChange: () => {},
    disabled: false
  }
}
