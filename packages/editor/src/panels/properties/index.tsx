import { ErrorBoundary } from '@ir-engine/hyperflux'
import { Tooltip } from '@ir-engine/ui'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { TabData } from 'rc-dock'
import React, { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import PropertiesEditor from './propertyeditor'

const PropertiesPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer>
        <Tooltip content={t('editor:properties.info')}>
          <PanelTitle>{t('editor:properties.title')}</PanelTitle>
        </Tooltip>
      </PanelDragContainer>
    </div>
  )
}

export const PropertiesPanelTab: TabData = {
  id: 'propertiesPanel',
  closable: true,
  cached: true,
  title: <PropertiesPanelTitle />,
  content: (
    <ErrorBoundary fallback={<div>Error occured with the properties tab</div>}>
      <Suspense>
        <PropertiesEditor />
      </Suspense>
    </ErrorBoundary>
  )
}
