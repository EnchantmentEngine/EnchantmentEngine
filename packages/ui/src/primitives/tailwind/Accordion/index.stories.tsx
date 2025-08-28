import React from 'react'
import { HiMinus, HiPlusSmall } from 'react-icons/hi2'

import Button from '../Button'
import Input from '../Input'
import Accordion from './index'

export default {
  title: 'Primitives/Tailwind/Accordion',
  component: Accordion,
  parameters: {
    componentSubtitle: 'Accordion',
    design: {
      type: 'figma',
      url: ''
    }
  }
}

export const Default = {
  args: {
    title: 'Task Server',
    subtitle: 'Edit App Title, Subtitle, PWA, Logo, Icon, Release Name, Audio and Video codec',
    expandIcon: <HiPlusSmall />,
    shrinkIcon: <HiMinus />,
    children: (
      <>
        <div className="flex w-full justify-between gap-4">
          <Input
            labelProps={{
              text: 'Port',
              position: 'top'
            }}
            value="3030"
          />
          <Input
            labelProps={{
              text: 'Process Interval',
              position: 'top'
            }}
            value="30"
          />
        </div>
        <div className="flex w-3/12 justify-between gap-4">
          <Button fullWidth className="">
            Cancel
          </Button>
          <Button fullWidth variant="primary">
            Submit
          </Button>
        </div>
      </>
    )
  }
}
