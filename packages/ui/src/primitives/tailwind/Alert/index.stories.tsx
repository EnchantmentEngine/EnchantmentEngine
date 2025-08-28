import Alert, { AlertVariantEnum } from './index'

export default {
  title: 'Primitives/Tailwind/Alert',
  component: Alert,
  parameters: {
    componentSubtitle: 'Alert',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    title: 'Alert',
    message: 'Here alert message.',
    variant: AlertVariantEnum.SUCCESS
  }
}
