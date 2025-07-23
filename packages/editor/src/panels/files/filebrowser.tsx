import { FileThumbnailJobState } from '@ir-engine/client-core/src/common/services/FileThumbnailJobState'
import useLoadingThumbnails from '@ir-engine/client-core/src/hooks/useLoadingThumbnails'
import { useFind } from '@ir-engine/common'
import { StaticResourceType, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import InfiniteScroll from '@ir-engine/ui/src/components/tailwind/InfiniteScroll'
import React, { useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'
import { twMerge } from 'tailwind-merge'
import { SupportedFileTypes } from '../../constants/AssetTypes'
import { EditorState } from '../../services/EditorServices'
import { FilesState, FilesViewModeState, SelectedFilesState } from '../../services/FilesState'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'
import { FileContextMenu } from './contextmenu'
import FileItem, { TableWrapper } from './fileitem'
import {
  CurrentFilesQueryProvider,
  FILES_PAGE_LIMIT,
  canDropOnFileBrowser,
  useCurrentFiles,
  useFileBrowserDrop
} from './helpers'
import FilesLoaders from './loaders'

export function Browser() {
  const [anchorEvent, setAnchorEvent] = useState<undefined | React.MouseEvent>(undefined)
  const dropOnFileBrowser = useFileBrowserDrop()
  const filesState = useMutableState(FilesState)
  const [{ isFileDropOver }, fileDropRef] = useDrop({
    accept: [...SupportedFileTypes],
    drop: (dropItem) => dropOnFileBrowser(dropItem as any),
    canDrop: () => canDropOnFileBrowser(filesState.selectedDirectory.value),
    collect: (monitor) => ({ isFileDropOver: monitor.canDrop() && monitor.isOver() })
  })
  const isListView = useMutableState(FilesViewModeState).viewMode.value === 'list'
  const selectedFiles = useMutableState(SelectedFilesState)
  const { files, refreshDirectory, filesQuery } = useCurrentFiles()
  const thumbnailJobState = useMutableState(FileThumbnailJobState)
  const { projectName } = useMutableState(FilesState)
  const staticResourceData = useHookstate<Record<string, Record<string, string>>>({})

  const [sortConfig, setSortConfig] = useState({ key: null as null | string, direction: 'asc' })

  const isLoading = useHookstate(false)
  useLoadingThumbnails(isLoading)

  const handleSort = (columnKey: string) => {
    setSortConfig((prevConfig) => {
      const newDirection = prevConfig.key === columnKey && prevConfig.direction === 'asc' ? 'desc' : 'asc'
      return { key: columnKey, direction: newDirection }
    })
  }

  useEffect(() => {
    if (isLoading.value) return
    refreshDirectory()
  }, [isLoading.value])

  const staticResourceDataQuery = useFind(staticResourcePath, {
    query: {
      key: {
        $in: files.map((file) => file.key)
      },
      project: projectName.value,
      $select: ['key', 'userId', 'user', 'stats', 'createdAt'],
      $limit: FILES_PAGE_LIMIT
    }
  })

  useEffect(() => {
    if (staticResourceDataQuery.status !== 'success') return
    const additionalData: Record<string, Record<string, string>> = {}
    staticResourceDataQuery.data.forEach((data: StaticResourceType) => {
      additionalData[data.key] = {
        createdAt: new Date(data.createdAt).toLocaleString(),
        author: data.user ? data.user.name : 'iR Starter Content',
        statistics: Object.keys({ ...data.stats }).length ? JSON.stringify(data.stats) : ''
      }
    })
    staticResourceData.set(additionalData)
  }, [staticResourceDataQuery.status])

  const sortedFiles = React.useMemo(() => {
    if (!sortConfig.key) return files

    const sorted = [...files].sort(($a, $b) => {
      const additionalDataA = staticResourceData.value[$a?.key] || {}
      const additionalDataB = staticResourceData.value[$b?.key] || {}
      const a = { ...$a, ...additionalDataA }
      const b = { ...$b, ...additionalDataB }

      const { key, direction } = sortConfig
      let valueA: any = (key && a[key]) || ''
      let valueB: any = (key && b[key]) || ''

      if (key === 'createdAt') {
        valueA = new Date(valueA)
        valueB = new Date(valueB)
      } else if (key === 'size') {
        valueA = parseFloat(valueA) || 0
        valueB = parseFloat(valueB) || 0
      } else if (key === 'type' || key === 'author' || key === 'name' || key === 'statistics') {
        valueA = valueA.toString().toLowerCase()
        valueB = valueB.toString().toLowerCase()
      }

      if (valueA < valueB) return direction === 'asc' ? -1 : 1
      if (valueA > valueB) return direction === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [files, sortConfig, staticResourceData])

  const FileItems = () => (
    <>
      <InfiniteScroll
        disableEvent={!filesQuery || filesQuery.limit >= filesQuery?.total}
        onScrollBottom={() => {
          filesQuery?.setLimit(filesQuery.limit + FILES_PAGE_LIMIT)
        }}
      >
        <div className="flex h-full w-full flex-wrap">
          {sortedFiles.map((file, idx) => {
            const backgroundColor = idx % 2 === 0 ? 'bg-surface-1' : 'bg-surface-0'
            return (
              <FileItem
                file={{ ...file, ...staticResourceData.value[file?.key] }}
                onContextMenu={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  if (!selectedFiles.value.find((selectedFile) => selectedFile.key === file.key)) {
                    selectedFiles.set([file])
                  }
                  setAnchorEvent(event)
                }}
                key={file.key}
                data-testid="files-panel-file-item"
                className={`${isListView ? `${backgroundColor}` : ''}`}
              />
            )
          })}
        </div>
      </InfiniteScroll>
    </>
  )

  return (
    <div
      className={twMerge('h-full overflow-y-auto bg-surface-1', isFileDropOver ? 'border-2 border-gray-300' : '')}
      ref={fileDropRef}
      onContextMenu={(event) => {
        event.preventDefault()
        event.stopPropagation()
        selectedFiles.set([])
        setAnchorEvent(event)
      }}
    >
      <div
        className={twMerge('mb-2 h-auto pb-6 text-gray-400 ', !isListView && 'flex py-8')}
        onClick={(event) => {
          event.stopPropagation()
          selectedFiles.set([])
          ClickPlacementState.resetSelectedAsset()
        }}
      >
        <div className={twMerge(!isListView && 'flex flex-wrap gap-2')}>
          {isListView ? (
            <TableWrapper handleSort={handleSort}>
              <FileItems />
            </TableWrapper>
          ) : (
            <FileItems />
          )}
        </div>
      </div>
      <FileContextMenu anchorEvent={anchorEvent} setAnchorEvent={setAnchorEvent} />
    </div>
  )
}

export default function FileBrowser() {
  const filesState = useMutableState(FilesState)

  const projectName = useMutableState(EditorState).projectName.value
  useEffect(() => {
    if (projectName) {
      filesState.merge({ selectedDirectory: `/projects/${projectName}/public/`, projectName: projectName })
    }
  }, [projectName])

  return (
    <CurrentFilesQueryProvider>
      <FilesLoaders />
      <Browser />
    </CurrentFilesQueryProvider>
  )
}
