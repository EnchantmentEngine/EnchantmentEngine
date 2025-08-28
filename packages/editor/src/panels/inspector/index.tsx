import { ErrorBoundary } from '@ir-engine/hyperflux'
import { Tooltip } from '@ir-engine/ui'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { TabData } from 'rc-dock'
import React, { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import InspectorPanel from './inspectoreditor'

const InspectorPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer>
        <Tooltip content={t('editor:properties.info')}>
          <PanelTitle>{t('editor:inspector.title')}</PanelTitle>
        </Tooltip>
      </PanelDragContainer>
    </div>
  )
}

export const InspectorPanelTab: TabData = {
  id: 'inspectorPanel',
  closable: true,
  cached: true,
  title: <InspectorPanelTitle />,
  content: (
    <ErrorBoundary fallback={<div>Error occured with the inspector tab</div>}>
      <Suspense>
        <InspectorPanel />
      </Suspense>
    </ErrorBoundary>
  )
}
