import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'
import { FileDataType } from '../constants/AssetTypes'

export const FilesViewModeState = defineState({
  name: 'FilesViewModeState',
  initial: {
    viewMode: 'icons' as 'icons' | 'list'
  },
  extension: syncStateWithLocalStorage(['viewMode'])
})

export const FilesState = defineState({
  name: 'FilesState',
  initial: () => ({
    selectedDirectory: '',
    projectName: '',
    clipboardFiles: { files: [] } as { isCopy?: boolean; files: FileDataType[] },
    searchText: ''
  })
})

export const SelectedFilesState = defineState({
  name: 'FilesSelectedFilesState',
  initial: [] as FileDataType[]
})
