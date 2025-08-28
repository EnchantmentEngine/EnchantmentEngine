import React from 'react'

import { useHookstate } from '@ir-engine/hyperflux'

import MultiEmailInput from './index'

const Story = () => {
  const emailList = useHookstate([] as string[])
  return <MultiEmailInput emailList={emailList} />
}

export default {
  title: 'Primitives/Tailwind/MultiEmailInput',
  component: Story,
  parameters: {
    componentSubtitle: 'MultiEmailInput',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {}
}
