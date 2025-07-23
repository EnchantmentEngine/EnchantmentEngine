import { getMutableState, NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { TabData } from 'rc-dock'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FilesState } from '../../services/FilesState'
import { ImportSettingsState } from '../../services/ImportSettingsState'
import FileBrowser from '../files/filebrowser'
import { CurrentFilesQueryProvider } from '../files/helpers'
import FilesToolbar from '../files/toolbar'
import CategoriesList, { VerticalDivider } from './categories'
import { AssetsQueryProvider } from './hooks'
import Resources from './resources'
import Topbar from './topbar'

const AssetsPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer dataTestId="assets-panel-tab">
        <PanelTitle>
          <span>{t('editor:tabs.scene-assets')}</span>
        </PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const AssetsPanelTab: TabData = {
  id: 'assetsPanel',
  closable: true,
  title: <AssetsPanelTitle />,
  content: (
    <AssetsQueryProvider>
      <AssetsContainer />
    </AssetsQueryProvider>
  )
}

const SidebarType = {
  FAVORITES: 'favorites',
  ASSETS: 'assets',
  FILES: 'files'
} as const

type SidebarTypeType = (typeof SidebarType)[keyof typeof SidebarType]

function AssetsContainer() {
  const sidebarType = useHookstate<SidebarTypeType | undefined>(undefined)

  const toolbar = sidebarType.value === SidebarType.FILES ? <FilesToolbar /> : <Topbar />
  const rightChildren = sidebarType.value === SidebarType.FILES ? <FileBrowser /> : <Resources />

  const initAssetsSidebar = () => {
    const projectName = getMutableState(FilesState).projectName.get(NO_PROXY)
    const importFolder = getMutableState(ImportSettingsState).importFolder.get(NO_PROXY)
    const dir = `/projects/${projectName}${importFolder}`
    getMutableState(FilesState).selectedDirectory.set(dir)
  }

  useEffect(() => initAssetsSidebar(), [])

  useEffect(() => {
    if (sidebarType.value === SidebarType.ASSETS) {
      initAssetsSidebar()
    }
  }, [sidebarType])

  const handleSidebarChange = (category) => {
    sidebarType.set(category)
  }

  return (
    <div className="flex h-full flex-col">
      <CurrentFilesQueryProvider>
        {toolbar}
        <VerticalDivider
          leftChildren={<CategoriesList selected={sidebarType.value} onClick={handleSidebarChange} />}
          rightChildren={rightChildren}
        />
      </CurrentFilesQueryProvider>
    </div>
  )
}
