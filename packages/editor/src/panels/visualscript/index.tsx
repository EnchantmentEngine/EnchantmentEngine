import { TabData } from 'rc-dock'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import VisualFlow from './container'

const VisualScriptPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer>
        <PanelTitle>
          <span>{t('editor:visualScript.panel.title')}</span>
        </PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const VisualScriptPanelTab: TabData = {
  id: 'visualScriptPanel',
  closable: true,
  title: <VisualScriptPanelTitle />,
  content: <VisualFlow />
}
