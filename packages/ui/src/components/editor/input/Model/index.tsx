import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { ModelFileTypes } from '@ir-engine/spatial/src/resources/fileTypes'
import React from 'react'
import FileBrowserInput from '../FileBrowser'
import { StringInputProps } from '../String'

export function ModelInput({ onRelease, ...rest }: StringInputProps) {
  return (
    <FileBrowserInput
      acceptFileTypes={ModelFileTypes}
      acceptDropItems={ItemTypes.Models}
      onRelease={onRelease}
      {...rest}
    />
  )
}

ModelInput.defaultProps = {}

export default ModelInput
