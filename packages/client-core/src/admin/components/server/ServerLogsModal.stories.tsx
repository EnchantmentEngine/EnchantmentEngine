import ServerLogsModal from './ServerLogsModal'

export default {
  title: 'Client/ServerLogsModal',
  component: ServerLogsModal,
  parameters: {
    componentSubtitle: 'ServerLogsModal',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    podName: '',
    containerName: ''
  }
}
