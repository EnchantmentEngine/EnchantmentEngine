import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { AllFileTypes } from '@ir-engine/spatial/src/resources/fileTypes'
import React from 'react'
import FileBrowserInput from '../FileBrowser'
import { StringInputProps } from '../String'

export function FolderInput({ ...rest }: StringInputProps) {
  return <FileBrowserInput acceptFileTypes={AllFileTypes} acceptDropItems={[ItemTypes.Folder]} {...rest} />
}

FolderInput.defaultProps = {}

export default FolderInput
