import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ErrorBoundary, useMutableState } from '@ir-engine/hyperflux'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { TabData } from 'rc-dock'
import React, { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import HierarchyTreeContextMenu from './contextmenu'
import { Contents, Topbar } from './hierarchytree'
import { HierarchyPanelProvider } from './hooks'

const HierarchyPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer dataTestId="hierarchy-panel-tab">
        <PanelTitle>{t('editor:hierarchy.lbl')}</PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const HierarchyPanelTab: TabData = {
  id: 'hierarchyPanel',
  closable: true,
  title: <HierarchyPanelTitle />,
  content: (
    <ErrorBoundary fallback={<div>Error occured with the Hierarchy tab</div>}>
      <Suspense>
        <HierarchyPanelWrapper />
      </Suspense>
    </ErrorBoundary>
  )
}

function HierarchyPanelWrapper() {
  const { scenePath, rootEntity } = useMutableState(EditorState).value
  const sourceID = GLTFComponent.useSourceID(rootEntity)

  if (!scenePath || !rootEntity || !sourceID) return null

  return <HierarchyPanel />
}

function HierarchyPanel() {
  return (
    <HierarchyPanelProvider>
      <Topbar />
      <Contents />
      <HierarchyTreeContextMenu />
    </HierarchyPanelProvider>
  )
}
