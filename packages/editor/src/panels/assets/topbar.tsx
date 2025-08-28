import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useFind } from '@ir-engine/common'
import { staticResourceTagPath } from '@ir-engine/common/src/schema.type.module'
import { getState, useMutableState } from '@ir-engine/hyperflux'
import { Button, Tooltip } from '@ir-engine/ui'
import { ViewportButton } from '@ir-engine/ui/editor'
import SearchBar from '@ir-engine/ui/src/components/tailwind/SearchBar'
import { Download01Sm, FolderSm, PlusCircleSm, SearchSmSm } from '@ir-engine/ui/src/icons'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { validateImportFolderPath } from '../../components/dialogs/ImportSettingsPanelDialog'
import { inputFileWithAddToScene } from '../../functions/assetFunctions'
import { EditorState } from '../../services/EditorServices'
import { FilesState } from '../../services/FilesState'
import { ImportSettingsState } from '../../services/ImportSettingsState'
import { handleDownloadProject, ProjectDownloadProgress } from '../files/loaders'
import { BreadCrumbSlash, PanelToolbar } from '../files/toolbar'
import { AssetCategoryNode } from './categories'
import { findCategoryByPath } from './helpers'
import { AssetsRefreshState, useAssetsCategory, useAssetsQuery } from './hooks'

export const uploadFiles = (): Promise<null> =>
  new Promise((resolve, reject) => {
    const projectName = getState(EditorState).projectName
    const importFolder = getState(ImportSettingsState).importFolder

    try {
      validateImportFolderPath(importFolder)
    } catch (e) {
      NotificationService.dispatchNotify(e.message, { variant: 'error' })
      reject(e)
    }

    inputFileWithAddToScene({
      projectName: projectName as string,
      directoryPath: `projects/${projectName}${importFolder}`
    })
      .then((data) => {
        resolve(data)
      })
      .catch((err) => {
        NotificationService.dispatchNotify(err.message, { variant: 'error' })
        reject(err)
      })
  })

export function AssetsBreadcrumbs() {
  const { currentCategoryPath } = useAssetsCategory()
  const assetCategories = useFind(staticResourceTagPath, {
    query: {
      project: getState(EditorState).projectName
    }
  })
  const currentCategory = currentCategoryPath.get({ noproxy: true }) as AssetCategoryNode

  const breadcrumbTrail = currentCategory?.path
    ? currentCategory.path.split('/').map((name, index, array) => ({
        name,
        path: array.slice(0, index + 1).join('/')
      }))
    : []

  const handleSelectParentCategory = (index: number) => {
    const selectedPath = breadcrumbTrail[index].path
    const newParent = findCategoryByPath(assetCategories as AssetCategoryNode[], selectedPath)
    currentCategoryPath.set(newParent || undefined)
    AssetsRefreshState.triggerRefresh()
  }

  return (
    <div className="grid grid-cols-[auto_auto] items-center gap-2" data-testid="assets-panel-breadcrumbs">
      <FolderSm onClick={() => handleSelectParentCategory(0)} className="text-base text-text-secondary" />
      <div className="flex w-full items-center gap-2 overflow-x-auto">
        {breadcrumbTrail.map((category, idx) => (
          <div key={category.path} className="flex items-center">
            <span
              className="cursor-pointer whitespace-nowrap text-base text-text-secondary"
              data-testid={`assets-panel-breadcrumb-nested-level-${idx}`}
              onClick={() => handleSelectParentCategory(idx)}
            >
              {category.name}
            </span>
            {idx < breadcrumbTrail.length - 1 && <BreadCrumbSlash />}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Topbar() {
  const { t } = useTranslation()
  const { search } = useAssetsQuery()
  const { currentCategoryPath } = useAssetsCategory()
  const filesState = useMutableState(FilesState)
  const { staticResourcesPagination } = useAssetsQuery()

  const handleBack = () => {
    const path = currentCategoryPath.value?.path.split('/') ?? []
    if (path.length <= 1) {
      currentCategoryPath.set(undefined)
      return
    }
    const selectedPath = path.slice(0, path.length - 1).join('/')
    const foundCategory = findCategoryByPath(assetCategories as AssetCategoryNode[], selectedPath)
    currentCategoryPath.set(foundCategory || undefined)
    AssetsRefreshState.triggerRefresh()
  }

  const handleRefresh = () => {
    AssetsRefreshState.triggerRefresh()
  }

  useEffect(() => {
    staticResourcesPagination.skip.set(0)
    AssetsRefreshState.triggerRefresh()
  }, [search.query])

  return (
    <PanelToolbar
      onBackDirectory={handleBack}
      onRefreshDirectory={handleRefresh}
      breadcrumbComponent={<AssetsBreadcrumbs />}
      searchbar={
        <SearchBar
          inputProps={{
            placeholder: t('editor:layout.scene-assets.search-placeholder'),
            height: 'xs',
            startComponent: <SearchSmSm className="h-5 w-5 text-[#A3A3A3]" />
          }}
          search={search}
        />
      }
      utilsComponent={
        <>
          <Tooltip content={t('editor:layout.filebrowser.downloadProject')}>
            <ViewportButton
              onClick={() => handleDownloadProject(filesState.projectName.value, filesState.selectedDirectory.value)}
              data-testid="files-panel-download-project-button"
              icon={Download01Sm}
              id="downloadProject"
            />
          </Tooltip>
          <ProjectDownloadProgress />
        </>
      }
      uploadButton={
        <Button
          variant="tertiary"
          size="l"
          data-testid="assets-panel-upload-button"
          onClick={() => uploadFiles().then(handleRefresh)}
        >
          <PlusCircleSm />
          <span className="text-nowrap">{t('editor:layout.filebrowser.uploadAssets')}</span>
        </Button>
      }
      dataTestIdJson={{
        topbarId: 'assets-panel-top-bar',
        backButtonId: 'assets-panel-back-button',
        refreshButtonId: 'assets-panel-refresh-button',
        createNewFolderButtonId: 'assets-panel-create-new-folder-button'
      }}
    />
  )
}
