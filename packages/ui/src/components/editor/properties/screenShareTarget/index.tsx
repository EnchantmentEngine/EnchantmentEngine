import { TbScreenShare } from 'react-icons/tb'

import React from 'react'
import { useTranslation } from 'react-i18next'

import { EditorComponentType } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { ScreenshareTargetComponent } from '@ir-engine/engine/src/scene/components/ScreenshareTargetComponent'

export const ScreenshareTargetNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  return (
    <NodeEditor
      {...props}
      component={ScreenshareTargetComponent}
      name={t('editor:properties.screenshare.name')}
      description={t('editor:properties.screenshare.description')}
      Icon={ScreenshareTargetNodeEditor.iconComponent}
    />
  )
}

ScreenshareTargetNodeEditor.iconComponent = TbScreenShare

export default ScreenshareTargetNodeEditor
